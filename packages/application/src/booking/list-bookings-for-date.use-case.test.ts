import { describe, it, expect } from 'vitest';
import { Booking, Customer, Service, Slot } from '@hetcho/domain';
import {
  BookingId,
  CustomerId,
  ServiceId,
  StaffId,
  TenantId,
} from '@hetcho/shared';
import { ListBookingsForDateUseCase } from './list-bookings-for-date.use-case.js';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';
const SERVICE_ID = '22222222-2222-2222-2222-222222222222';
const CUSTOMER_ID = '33333333-3333-3333-3333-333333333333';
const STAFF_ID = '44444444-4444-4444-4444-444444444444';

function makeCustomer(name = 'Chị Hằng') {
  return Customer.create({
    id: CustomerId(CUSTOMER_ID),
    tenantId: TenantId(TENANT_ID),
    name,
    phoneHash: 'h',
    phoneMasked: '09***1234',
    tier: 'normal',
    lifetimeSpendVnd: 0,
    totalBookings: 0,
  });
}

function makeService(name = 'Cắt + Gội') {
  return Service.create({
    id: ServiceId(SERVICE_ID),
    tenantId: TenantId(TENANT_ID),
    name,
    durationMinutes: 60,
    priceVnd: 300_000,
    depositNormalVnd: 0,
    depositPeakVnd: 100_000,
    isActive: true,
  });
}

function makeBookingAt(time: string, bookingId: string): Booking {
  return Booking.create({
    id: BookingId(bookingId),
    tenantId: TenantId(TENANT_ID),
    customerId: CustomerId(CUSTOMER_ID),
    serviceId: ServiceId(SERVICE_ID),
    staffId: StaffId(STAFF_ID),
    slot: Slot.create(new Date(time), 60),
    isPeakSlot: false,
    depositRequiredVnd: 0,
  });
}

describe('ListBookingsForDateUseCase', () => {
  it('should return rows sorted by start time with joined names', async () => {
    const b1 = makeBookingAt('2026-06-01T14:00:00Z', '55555555-5555-5555-5555-555555555555');
    const b2 = makeBookingAt('2026-06-01T10:00:00Z', '66666666-6666-6666-6666-666666666666');
    const useCase = new ListBookingsForDateUseCase({
      bookings: {
        findById: async () => null,
        findOverlapping: async () => [],
        findByTenantAndDate: async () => [b1, b2],
        save: async () => {},
      },
      customers: { findById: async () => makeCustomer(), save: async () => {} },
      services: { findById: async () => makeService() },
      staff: {
        findById: async () => ({
          id: StaffId(STAFF_ID),
          tenantId: TenantId(TENANT_ID),
          name: 'Thợ Tú',
          workingHours: {},
          serviceIds: [SERVICE_ID],
          isActive: true,
        }),
      },
    });

    const rows = await useCase.execute({ tenantId: TENANT_ID, date: '2026-06-01' });
    expect(rows).toHaveLength(2);
    expect(rows[0]?.bookingId).toBe('66666666-6666-6666-6666-666666666666');
    expect(rows[1]?.bookingId).toBe('55555555-5555-5555-5555-555555555555');
    expect(rows[0]?.customerName).toBe('Chị Hằng');
    expect(rows[0]?.staffName).toBe('Thợ Tú');
    expect(rows[0]?.serviceName).toBe('Cắt + Gội');
  });

  it('should fallback when customer/service/staff missing', async () => {
    const b1 = makeBookingAt('2026-06-01T10:00:00Z', '77777777-7777-7777-7777-777777777777');
    const useCase = new ListBookingsForDateUseCase({
      bookings: {
        findById: async () => null,
        findOverlapping: async () => [],
        findByTenantAndDate: async () => [b1],
        save: async () => {},
      },
      customers: { findById: async () => null, save: async () => {} },
      services: { findById: async () => null },
      staff: { findById: async () => null },
    });

    const rows = await useCase.execute({ tenantId: TENANT_ID, date: '2026-06-01' });
    expect(rows[0]?.customerName).toBe('(khách lạ)');
    expect(rows[0]?.serviceName).toBe('(dịch vụ ẩn)');
    expect(rows[0]?.staffName).toBe('(thợ ẩn)');
  });

  it('should return empty array when no bookings for date', async () => {
    const useCase = new ListBookingsForDateUseCase({
      bookings: {
        findById: async () => null,
        findOverlapping: async () => [],
        findByTenantAndDate: async () => [],
        save: async () => {},
      },
      customers: { findById: async () => null, save: async () => {} },
      services: { findById: async () => null },
      staff: { findById: async () => null },
    });

    const rows = await useCase.execute({ tenantId: TENANT_ID, date: '2026-06-02' });
    expect(rows).toEqual([]);
  });
});
