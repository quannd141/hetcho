import { z } from 'zod';
import type { BookingRepository } from '@hetcho/domain';
import { TenantId as TenantIdBrand } from '@hetcho/shared';
import type { CustomerRepository, ServiceRepository } from './ports.js';
import type { StaffWriteRepository } from '../tenant/ports.js';

export const ListBookingsForDateInput = z.object({
  tenantId: z.string().uuid(),
  date: z.coerce.date(),
});
export type ListBookingsForDateInput = z.infer<typeof ListBookingsForDateInput>;

export interface BookingDashboardRow {
  bookingId: string;
  status: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  isPeakSlot: boolean;
  customerName: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  depositRequiredVnd: number;
  depositPaidVnd: number;
  finalPriceVnd: number | null;
}

export interface ListBookingsDeps {
  bookings: BookingRepository;
  customers: CustomerRepository;
  services: ServiceRepository;
  staff: Pick<StaffWriteRepository, 'findById'>;
}

/**
 * Query use case cho dashboard ngày — trả về flattened projection
 * (booking + tên khách + tên dịch vụ + tên thợ) sắp xếp theo giờ.
 */
export class ListBookingsForDateUseCase {
  constructor(private readonly deps: ListBookingsDeps) {}

  async execute(rawInput: unknown): Promise<BookingDashboardRow[]> {
    const input = ListBookingsForDateInput.parse(rawInput);
    const tenantId = TenantIdBrand(input.tenantId);

    const bookings = await this.deps.bookings.findByTenantAndDate(tenantId, input.date);
    bookings.sort((a, b) => a.slot.startAt.getTime() - b.slot.startAt.getTime());

    const rows: BookingDashboardRow[] = [];
    for (const b of bookings) {
      const props = b.toJSON();
      const [customer, service, staff] = await Promise.all([
        this.deps.customers.findById(props.customerId, tenantId),
        this.deps.services.findById(props.serviceId, tenantId),
        this.deps.staff.findById(props.staffId, tenantId),
      ]);
      rows.push({
        bookingId: props.id,
        status: props.status,
        startAt: props.slot.startAt.toISOString(),
        endAt: props.slot.endAt.toISOString(),
        durationMinutes: props.slot.durationMinutes,
        isPeakSlot: props.isPeakSlot,
        customerName: customer?.toJSON().name ?? '(khách lạ)',
        serviceName: service?.toJSON().name ?? '(dịch vụ ẩn)',
        staffId: props.staffId,
        staffName: staff?.name ?? '(thợ ẩn)',
        depositRequiredVnd: props.depositRequiredVnd,
        depositPaidVnd: props.depositPaidVnd,
        finalPriceVnd: props.finalPriceVnd,
      });
    }
    return rows;
  }
}
