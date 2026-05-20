import { describe, it, expect, beforeEach } from 'vitest';
import { Booking, Slot } from '@hetcho/domain';
import {
  BookingId,
  CustomerId,
  ServiceId,
  StaffId,
  TenantId,
} from '@hetcho/shared';
import { InMemoryBookingRepository } from '@hetcho/infrastructure';
import { AutoMarkNoShowUseCase } from './auto-mark-no-show.use-case.js';
import type { BookingDependencies } from './ports.js';

const TENANT_A = '11111111-1111-1111-1111-111111111111';
const TENANT_B = '22222222-2222-2222-2222-222222222222';
const SERVICE = '33333333-3333-3333-3333-333333333333';
const CUSTOMER = '44444444-4444-4444-4444-444444444444';
const STAFF = '55555555-5555-5555-5555-555555555555';

function makeConfirmedBooking(opts: {
  id: string;
  tenantId: string;
  startAtIso: string;
  depositPaid?: number;
  checkedInAt?: Date | null;
}): Booking {
  const b = Booking.create({
    id: BookingId(opts.id),
    tenantId: TenantId(opts.tenantId),
    customerId: CustomerId(CUSTOMER),
    serviceId: ServiceId(SERVICE),
    staffId: StaffId(STAFF),
    slot: Slot.create(new Date(opts.startAtIso), 60),
    isPeakSlot: false,
    depositRequiredVnd: 50_000,
  });
  b.payDeposit(opts.depositPaid ?? 50_000);
  if (opts.checkedInAt) {
    b.checkIn(opts.checkedInAt);
  }
  return b;
}

interface State {
  saves: number;
  audits: Array<{ action: string; payload: Record<string, unknown> }>;
  broadcasts: Array<{ type: string; payload?: Record<string, unknown> }>;
}

function makeDeps(repo: InMemoryBookingRepository, fixedNow: Date) {
  const state: State = { saves: 0, audits: [], broadcasts: [] };
  const deps: BookingDependencies = {
    now: () => fixedNow,
    generateId: () => 'gen',
    tenants: { findById: async () => null },
    services: { findById: async () => null },
    customers: { findById: async () => null, save: async () => undefined },
    bookings: {
      findById: (id) => repo.findById(id),
      findOverlapping: () => repo.findOverlapping({} as never),
      findByTenantAndDate: () => repo.findByTenantAndDate({} as never, new Date()),
      findStalePending: (t, d) => repo.findStalePending(t, d),
      findUnattendedConfirmed: (t, d) => repo.findUnattendedConfirmed(t, d),
      save: async (b) => {
        state.saves += 1;
        await repo.save(b);
      },
    },
    unitOfWork: {
      run: async (work) => work({ bookings: deps.bookings, customers: deps.customers, audit: deps.audit }),
    },
    payment: { createDeposit: async () => ({ paymentUrl: '', gatewayTxnId: '' }) },
    notification: {
      sendBookingConfirmation: async () => undefined,
      sendBookingCancellation: async () => undefined,
    },
    audit: {
      log: async ({ action, payload }) => {
        state.audits.push({ action, payload: payload ?? {} });
      },
    },
    broadcaster: {
      publish: async (evt) => {
        state.broadcasts.push({ type: evt.type, payload: evt.payload });
      },
    },
  };
  return { deps, state };
}

describe('AutoMarkNoShowUseCase', () => {
  let repo: InMemoryBookingRepository;

  beforeEach(() => {
    repo = new InMemoryBookingRepository();
  });

  it('marks confirmed booking that started > 30 minutes ago without check-in', async () => {
    const now = new Date('2026-07-01T11:00:00+07:00');
    const b = makeConfirmedBooking({
      id: '66666666-6666-6666-6666-666666660101',
      tenantId: TENANT_A,
      startAtIso: '2026-07-01T10:00:00+07:00', // 60 min ago
    });
    await repo.save(b);
    const { deps, state } = makeDeps(repo, now);

    const result = await new AutoMarkNoShowUseCase(deps).execute({ tenantId: TENANT_A });

    expect(result.markedCount).toBe(1);
    expect(result.depositForfeitedTotalVnd).toBe(50_000);
    expect(state.audits[0]?.action).toBe('booking.no_show');
    expect(state.audits[0]?.payload.depositForfeitedVnd).toBe(50_000);
    expect(state.broadcasts[0]?.type).toBe('booking.no_show');
    const reloaded = await repo.findById(b.id);
    expect(reloaded?.status).toBe('no_show');
    // Deposit preserved (shop keeps)
    expect(reloaded?.depositPaidVnd).toBe(50_000);
  });

  it('skips booking still within grace period', async () => {
    const now = new Date('2026-07-01T11:00:00+07:00');
    const b = makeConfirmedBooking({
      id: '66666666-6666-6666-6666-666666660102',
      tenantId: TENANT_A,
      startAtIso: '2026-07-01T10:45:00+07:00', // 15 min ago < 30 min
    });
    await repo.save(b);
    const { deps, state } = makeDeps(repo, now);

    const result = await new AutoMarkNoShowUseCase(deps).execute({ tenantId: TENANT_A });
    expect(result.markedCount).toBe(0);
    expect(state.saves).toBe(0);
  });

  it('skips booking already checked in', async () => {
    const now = new Date('2026-07-01T11:00:00+07:00');
    const b = makeConfirmedBooking({
      id: '66666666-6666-6666-6666-666666660103',
      tenantId: TENANT_A,
      startAtIso: '2026-07-01T10:00:00+07:00',
      checkedInAt: new Date('2026-07-01T10:05:00+07:00'),
    });
    expect(b.status).toBe('checked_in');
    await repo.save(b);
    const { deps } = makeDeps(repo, now);

    const result = await new AutoMarkNoShowUseCase(deps).execute({ tenantId: TENANT_A });
    expect(result.markedCount).toBe(0);
  });

  it('does not cross tenants', async () => {
    const now = new Date('2026-07-01T11:00:00+07:00');
    const other = makeConfirmedBooking({
      id: '66666666-6666-6666-6666-666666660104',
      tenantId: TENANT_B,
      startAtIso: '2026-07-01T10:00:00+07:00',
    });
    await repo.save(other);
    const { deps } = makeDeps(repo, now);

    const result = await new AutoMarkNoShowUseCase(deps).execute({ tenantId: TENANT_A });
    expect(result.markedCount).toBe(0);
    const reloaded = await repo.findById(other.id);
    expect(reloaded?.status).toBe('confirmed');
  });

  it('respects custom graceMinutes (=0 marks immediately past start)', async () => {
    const now = new Date('2026-07-01T11:00:00+07:00');
    const b = makeConfirmedBooking({
      id: '66666666-6666-6666-6666-666666660105',
      tenantId: TENANT_A,
      startAtIso: '2026-07-01T10:50:00+07:00', // 10 min ago
    });
    await repo.save(b);
    const { deps } = makeDeps(repo, now);

    const r1 = await new AutoMarkNoShowUseCase(deps).execute({
      tenantId: TENANT_A,
      graceMinutes: 30,
    });
    expect(r1.markedCount).toBe(0);

    const r2 = await new AutoMarkNoShowUseCase(deps).execute({
      tenantId: TENANT_A,
      graceMinutes: 5,
    });
    expect(r2.markedCount).toBe(1);
  });

  it('aggregates depositForfeitedTotalVnd across multiple bookings', async () => {
    const now = new Date('2026-07-01T11:00:00+07:00');
    await repo.save(
      makeConfirmedBooking({
        id: '66666666-6666-6666-6666-666666660106',
        tenantId: TENANT_A,
        startAtIso: '2026-07-01T10:00:00+07:00',
        depositPaid: 50_000,
      }),
    );
    await repo.save(
      makeConfirmedBooking({
        id: '66666666-6666-6666-6666-666666660107',
        tenantId: TENANT_A,
        startAtIso: '2026-07-01T10:00:00+07:00',
        depositPaid: 100_000,
      }),
    );
    const { deps } = makeDeps(repo, now);

    const result = await new AutoMarkNoShowUseCase(deps).execute({ tenantId: TENANT_A });
    expect(result.markedCount).toBe(2);
    expect(result.depositForfeitedTotalVnd).toBe(150_000);
  });
});
