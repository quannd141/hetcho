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
import { AutoReleaseStalePendingUseCase } from './auto-release-stale-pending.use-case.js';
import type { BookingDependencies } from './ports.js';

const TENANT_A = '11111111-1111-1111-1111-111111111111';
const TENANT_B = '22222222-2222-2222-2222-222222222222';
const SERVICE = '33333333-3333-3333-3333-333333333333';
const CUSTOMER = '44444444-4444-4444-4444-444444444444';
const STAFF = '55555555-5555-5555-5555-555555555555';

function makeBooking(opts: {
  id: string;
  tenantId: string;
  startAtIso: string;
  depositRequired?: number;
  createdAt?: Date;
}): Booking {
  const b = Booking.create({
    id: BookingId(opts.id),
    tenantId: TenantId(opts.tenantId),
    customerId: CustomerId(CUSTOMER),
    serviceId: ServiceId(SERVICE),
    staffId: StaffId(STAFF),
    slot: Slot.create(new Date(opts.startAtIso), 60),
    isPeakSlot: false,
    depositRequiredVnd: opts.depositRequired ?? 50_000,
  });
  if (opts.createdAt) {
    const p = b.toJSON();
    p.createdAt = opts.createdAt;
    return Booking.reconstruct(p);
  }
  return b;
}

interface State {
  saves: number;
  audits: Array<{ action: string; entityId: string }>;
  broadcasts: Array<{ type: string; bookingId: string }>;
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
      log: async ({ action, entityId }) => {
        state.audits.push({ action, entityId });
      },
    },
    broadcaster: {
      publish: async (evt) => {
        state.broadcasts.push({ type: evt.type, bookingId: evt.bookingId });
      },
    },
  };
  return { deps, state };
}

describe('AutoReleaseStalePendingUseCase', () => {
  let repo: InMemoryBookingRepository;

  beforeEach(() => {
    repo = new InMemoryBookingRepository();
  });

  it('releases pending booking created > 5 minutes ago', async () => {
    const now = new Date('2026-07-01T10:00:00+07:00');
    const stale = makeBooking({
      id: '66666666-6666-6666-6666-666666660001',
      tenantId: TENANT_A,
      startAtIso: '2026-07-01T15:00:00+07:00',
      createdAt: new Date(now.getTime() - 10 * 60_000),
    });
    await repo.save(stale);
    const { deps, state } = makeDeps(repo, now);

    const result = await new AutoReleaseStalePendingUseCase(deps).execute({ tenantId: TENANT_A });

    expect(result.releasedCount).toBe(1);
    expect(state.saves).toBe(1);
    expect(state.audits[0]?.action).toBe('booking.auto_released');
    expect(state.broadcasts[0]?.type).toBe('booking.cancelled');
    const reloaded = await repo.findById(stale.id);
    expect(reloaded?.status).toBe('cancelled');
  });

  it('skips pending booking created < 5 minutes ago', async () => {
    const now = new Date('2026-07-01T10:00:00+07:00');
    const fresh = makeBooking({
      id: '66666666-6666-6666-6666-666666660002',
      tenantId: TENANT_A,
      startAtIso: '2026-07-01T15:00:00+07:00',
      createdAt: new Date(now.getTime() - 60_000),
    });
    await repo.save(fresh);
    const { deps, state } = makeDeps(repo, now);

    const result = await new AutoReleaseStalePendingUseCase(deps).execute({ tenantId: TENANT_A });

    expect(result.releasedCount).toBe(0);
    expect(state.saves).toBe(0);
  });

  it('skips confirmed booking (only pending is released)', async () => {
    const now = new Date('2026-07-01T10:00:00+07:00');
    const confirmed = makeBooking({
      id: '66666666-6666-6666-6666-666666660003',
      tenantId: TENANT_A,
      startAtIso: '2026-07-01T15:00:00+07:00',
      depositRequired: 0,
      createdAt: new Date(now.getTime() - 10 * 60_000),
    });
    expect(confirmed.status).toBe('confirmed');
    await repo.save(confirmed);
    const { deps } = makeDeps(repo, now);

    const result = await new AutoReleaseStalePendingUseCase(deps).execute({ tenantId: TENANT_A });
    expect(result.releasedCount).toBe(0);
  });

  it('does not touch other tenant pending bookings', async () => {
    const now = new Date('2026-07-01T10:00:00+07:00');
    const otherTenantStale = makeBooking({
      id: '66666666-6666-6666-6666-666666660004',
      tenantId: TENANT_B,
      startAtIso: '2026-07-01T15:00:00+07:00',
      createdAt: new Date(now.getTime() - 30 * 60_000),
    });
    await repo.save(otherTenantStale);
    const { deps } = makeDeps(repo, now);

    const result = await new AutoReleaseStalePendingUseCase(deps).execute({ tenantId: TENANT_A });
    expect(result.releasedCount).toBe(0);
    const reloaded = await repo.findById(otherTenantStale.id);
    expect(reloaded?.status).toBe('pending');
  });

  it('respects custom pendingTimeoutMs', async () => {
    const now = new Date('2026-07-01T10:00:00+07:00');
    const b = makeBooking({
      id: '66666666-6666-6666-6666-666666660005',
      tenantId: TENANT_A,
      startAtIso: '2026-07-01T15:00:00+07:00',
      createdAt: new Date(now.getTime() - 2 * 60_000),
    });
    await repo.save(b);
    const { deps } = makeDeps(repo, now);

    const r1 = await new AutoReleaseStalePendingUseCase(deps).execute({
      tenantId: TENANT_A,
      pendingTimeoutMs: 5 * 60_000,
    });
    expect(r1.releasedCount).toBe(0);

    const r2 = await new AutoReleaseStalePendingUseCase(deps).execute({
      tenantId: TENANT_A,
      pendingTimeoutMs: 60_000,
    });
    expect(r2.releasedCount).toBe(1);
  });

  it('processes multiple stale bookings in one run', async () => {
    const now = new Date('2026-07-01T10:00:00+07:00');
    for (let i = 0; i < 3; i++) {
      await repo.save(makeBooking({
        id: `66666666-6666-6666-6666-66666666${(7000 + i).toString()}`,
        tenantId: TENANT_A,
        startAtIso: '2026-07-01T15:00:00+07:00',
        createdAt: new Date(now.getTime() - 10 * 60_000),
      }));
    }
    const { deps } = makeDeps(repo, now);

    const result = await new AutoReleaseStalePendingUseCase(deps).execute({ tenantId: TENANT_A });
    expect(result.releasedCount).toBe(3);
    expect(result.releasedIds).toHaveLength(3);
  });
});
