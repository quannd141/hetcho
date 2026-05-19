import { z } from 'zod';
import type { BookingRepository } from '@hetcho/domain';
import {
  NotFoundError,
  TenantId as TenantIdBrand,
  ServiceId as ServiceIdBrand,
  tzYMD,
  tzWeekday,
  tzHHMMToUtc,
} from '@hetcho/shared';
import type { ServiceRepository, TenantRepository } from './ports.js';

export const GetAvailabilitySlotsInput = z.object({
  tenantId: z.string().uuid(),
  serviceId: z.string().uuid(),
  date: z.coerce.date(),
});
export type GetAvailabilitySlotsInput = z.infer<typeof GetAvailabilitySlotsInput>;

export interface AvailabilitySlot {
  startAt: string;
  endAt: string;
  available: boolean;
  isPeak: boolean;
}

export interface GetAvailabilitySlotsDeps {
  tenants: TenantRepository;
  services: ServiceRepository;
  bookings: BookingRepository;
}

export class GetAvailabilitySlotsUseCase {
  constructor(private readonly deps: GetAvailabilitySlotsDeps) {}

  async execute(rawInput: unknown): Promise<{ tenantSlug: string; date: string; slots: AvailabilitySlot[] }> {
    const input = GetAvailabilitySlotsInput.parse(rawInput);
    const tenantId = TenantIdBrand(input.tenantId);
    const serviceId = ServiceIdBrand(input.serviceId);

    const tenant = await this.deps.tenants.findById(tenantId);
    if (!tenant) throw new NotFoundError('Tenant not found');
    const service = await this.deps.services.findById(serviceId, tenantId);
    if (!service) throw new NotFoundError('Service not found');

    const tenantProps = tenant.toJSON();
    const tz = tenantProps.timezone;
    const dateYMD = tzYMD(input.date, tz);
    const dayKey = tzWeekday(input.date, tz);
    const hours = tenantProps.workingHours[dayKey];
    if (!hours) {
      return { tenantSlug: tenantProps.slug, date: dateYMD, slots: [] };
    }

    const existingBookings = await this.deps.bookings.findByTenantAndDate(tenantId, input.date);
    const blockingBookings = existingBookings.filter((b) => {
      const status = b.toJSON().status;
      return status !== 'cancelled' && status !== 'no_show';
    });

    const slotMinutes = tenantProps.slotMinutes;
    const durationMinutes = service.durationMinutes;
    const slots: AvailabilitySlot[] = [];

    const dayStart = tzHHMMToUtc(dateYMD, hours.open, tz);
    const dayEnd = tzHHMMToUtc(dateYMD, hours.close, tz);

    for (let t = dayStart.getTime(); t + durationMinutes * 60_000 <= dayEnd.getTime(); t += slotMinutes * 60_000) {
      const start = new Date(t);
      const end = new Date(t + durationMinutes * 60_000);

      const conflicts = blockingBookings.some((b) => {
        const slot = b.toJSON().slot;
        return start < slot.endAt && end > slot.startAt;
      });

      slots.push({
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        available: !conflicts,
        isPeak: tenant.isPeakSlot(start),
      });
    }

    return { tenantSlug: tenantProps.slug, date: dateYMD, slots };
  }
}
