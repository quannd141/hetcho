import { z } from 'zod';
import {
  Booking,
  BookingConflictService,
  Slot,
  isWithinWorkingHours,
} from '@hetcho/domain';
import {
  AppError,
  BookingId,
  CustomerId,
  NotFoundError,
  ServiceId,
  StaffId,
  TenantId,
  ValidationError,
  ErrorCode,
} from '@hetcho/shared';
import type { BookingDependencies } from './ports.js';

export const CreateBookingInput = z.object({
  tenantId: z.string().uuid(),
  customerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid(),
  startAt: z.coerce.date(),
  returnUrl: z.string().url().optional(),
});
export type CreateBookingInput = z.infer<typeof CreateBookingInput>;

export interface CreateBookingResult {
  bookingId: BookingId;
  status: 'pending' | 'confirmed';
  requiresPayment: boolean;
  paymentUrl?: string;
}

/**
 * Use case: Khách (qua Mini App) tạo booking mới.
 *
 * Flow:
 * 1. Validate input + load tenant/service/customer
 * 2. Tính isPeak + deposit required
 * 3. Construct Slot — check working hours
 * 4. Check conflict với existing booking same staff
 * 5. Persist booking (status pending nếu cần cọc, confirmed nếu không)
 * 6. Nếu cần cọc → tạo payment URL qua gateway
 * 7. Audit log + notification
 */
export class CreateBookingUseCase {
  private readonly conflictService = new BookingConflictService();

  constructor(private readonly deps: BookingDependencies) {}

  async execute(rawInput: unknown): Promise<CreateBookingResult> {
    const input = CreateBookingInput.parse(rawInput);

    const tenant = await this.deps.tenants.findById(TenantId(input.tenantId));
    if (!tenant) throw new NotFoundError('Tenant not found', { tenantId: input.tenantId });

    const service = await this.deps.services.findById(
      ServiceId(input.serviceId),
      TenantId(input.tenantId),
    );
    if (!service) throw new NotFoundError('Service not found', { serviceId: input.serviceId });

    const customer = await this.deps.customers.findById(
      CustomerId(input.customerId),
      TenantId(input.tenantId),
    );
    if (!customer) throw new NotFoundError('Customer not found');

    if (input.startAt.getTime() <= this.deps.now().getTime()) {
      throw new ValidationError('startAt must be in the future');
    }

    const slot = Slot.create(input.startAt, service.durationMinutes);

    if (!isWithinWorkingHours(tenant.toJSON().workingHours, slot.startAt, service.durationMinutes)) {
      throw new AppError({
        code: ErrorCode.BOOKING_OUTSIDE_WORKING_HOURS,
        message: 'Slot outside tenant working hours',
        httpStatus: 400,
      });
    }

    const existing = await this.deps.bookings.findOverlapping({
      tenantId: TenantId(input.tenantId),
      staffId: StaffId(input.staffId),
      startAt: slot.startAt,
      endAt: slot.endAt,
    });
    this.conflictService.detect(slot, input.staffId, existing);

    const isPeak = tenant.isPeakSlot(slot.startAt);
    const depositRequiredVnd = service.computeDeposit(isPeak);

    const booking = Booking.create({
      id: BookingId(this.deps.generateId()),
      tenantId: TenantId(input.tenantId),
      customerId: CustomerId(input.customerId),
      serviceId: ServiceId(input.serviceId),
      staffId: StaffId(input.staffId),
      slot,
      isPeakSlot: isPeak,
      depositRequiredVnd,
    });

    let paymentUrl: string | undefined;

    await this.deps.unitOfWork.run(async (ctx) => {
      await ctx.bookings.save(booking);
      await ctx.audit.log({
        tenantId: booking.tenantId,
        actorType: 'customer',
        actorId: input.customerId,
        action: 'booking.created',
        entity: 'booking',
        entityId: booking.id,
        payload: {
          serviceId: input.serviceId,
          staffId: input.staffId,
          isPeak,
          depositRequiredVnd,
        },
      });
    });

    await this.deps.broadcaster?.publish({
      type: 'booking.created',
      tenantId: booking.tenantId,
      bookingId: booking.id,
      occurredAt: this.deps.now(),
      payload: { status: booking.status, staffId: input.staffId, startAt: slot.startAt.toISOString() },
    });

    if (depositRequiredVnd > 0) {
      if (!input.returnUrl) {
        throw new ValidationError('returnUrl required for paid booking');
      }
      const gw = await this.deps.payment.createDeposit({
        tenantId: booking.tenantId,
        bookingId: booking.id,
        amountVnd: depositRequiredVnd,
        returnUrl: input.returnUrl,
        customerPhoneMasked: customer.toJSON().phoneMasked,
      });
      paymentUrl = gw.paymentUrl;
    } else {
      await this.deps.notification.sendBookingConfirmation({
        tenantId: booking.tenantId,
        customerId: booking.toJSON().customerId,
        bookingId: booking.id,
      });
    }

    return {
      bookingId: booking.id,
      status: booking.status === 'pending' ? 'pending' : 'confirmed',
      requiresPayment: depositRequiredVnd > 0,
      paymentUrl,
    };
  }
}
