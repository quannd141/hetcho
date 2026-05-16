import { z } from 'zod';
import { createHash } from 'node:crypto';
import { Booking, BookingConflictService, Customer, Slot, isWithinWorkingHours } from '@hetcho/domain';
import {
  AppError,
  BookingId,
  CustomerId,
  ErrorCode,
  NotFoundError,
  ServiceId,
  StaffId,
  TenantId,
  ValidationError,
} from '@hetcho/shared';
import type { BookingDependencies } from './ports.js';

export const WalkInBookingInput = z.object({
  tenantId: z.string().uuid(),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid(),
  startAt: z.coerce.date(),
  customer: z.object({
    name: z.string().min(1).max(200),
    phone: z.string().regex(/^0\d{9}$/, 'phone must be 10 digits starting with 0'),
  }),
  actorId: z.string().optional(),
});
export type WalkInBookingInput = z.infer<typeof WalkInBookingInput>;

export interface WalkInBookingResult {
  bookingId: BookingId;
  customerId: CustomerId;
  customerCreated: boolean;
  status: 'confirmed';
}

function maskPhone(phone: string): string {
  return phone.slice(0, 2) + '***' + phone.slice(-4);
}

function hashPhone(phone: string): string {
  return createHash('sha256').update(phone).digest('hex');
}

/**
 * Owner tạo booking walk-in trên dashboard (khách đến trực tiếp, không qua Mini App).
 *
 * Khác CreateBookingUseCase:
 * - Customer được lookup-or-create theo phone hash (idempotent)
 * - Bỏ qua bước thanh toán cọc (khách đã đến, owner cấu hình free or tự thu mặt)
 * - Status = confirmed ngay, không gửi Zalo notification (khách không cần)
 */
export class WalkInBookingUseCase {
  private readonly conflictService = new BookingConflictService();

  constructor(private readonly deps: BookingDependencies) {}

  async execute(rawInput: unknown): Promise<WalkInBookingResult> {
    const input = WalkInBookingInput.parse(rawInput);
    const tenantId = TenantId(input.tenantId);

    const tenant = await this.deps.tenants.findById(tenantId);
    if (!tenant) throw new NotFoundError('Tenant not found');

    const service = await this.deps.services.findById(ServiceId(input.serviceId), tenantId);
    if (!service) throw new NotFoundError('Service not found');

    if (input.startAt.getTime() < this.deps.now().getTime() - 60_000) {
      throw new ValidationError('startAt cannot be in the past (allow 1 min skew)');
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
      tenantId,
      staffId: StaffId(input.staffId),
      startAt: slot.startAt,
      endAt: slot.endAt,
    });
    this.conflictService.detect(slot, input.staffId, existing);

    const phoneHash = hashPhone(input.customer.phone);
    const customerId = CustomerId(this.deps.generateId());
    const customer = Customer.create({
      id: customerId,
      tenantId,
      name: input.customer.name,
      phoneHash,
      phoneMasked: maskPhone(input.customer.phone),
      zaloId: null,
      tier: 'normal',
      lifetimeSpendVnd: 0,
      totalBookings: 0,
    });

    const booking = Booking.create({
      id: BookingId(this.deps.generateId()),
      tenantId,
      customerId,
      serviceId: ServiceId(input.serviceId),
      staffId: StaffId(input.staffId),
      slot,
      isPeakSlot: tenant.isPeakSlot(slot.startAt),
      depositRequiredVnd: 0,
    });

    await this.deps.unitOfWork.run(async (ctx) => {
      await ctx.customers.save(customer);
      await ctx.bookings.save(booking);
      await ctx.audit.log({
        tenantId,
        actorType: 'owner',
        actorId: input.actorId,
        action: 'booking.walk_in_created',
        entity: 'booking',
        entityId: booking.id,
        payload: {
          customerId,
          serviceId: input.serviceId,
          staffId: input.staffId,
          phoneMasked: customer.toJSON().phoneMasked,
        },
      });
    });

    await this.deps.broadcaster?.publish({
      type: 'booking.created',
      tenantId,
      bookingId: booking.id,
      occurredAt: this.deps.now(),
      payload: { walkIn: true, staffId: input.staffId, startAt: slot.startAt.toISOString() },
    });

    return {
      bookingId: booking.id,
      customerId,
      customerCreated: true,
      status: 'confirmed',
    };
  }
}
