import { describe, it, expect } from 'vitest';
import { Tenant } from './tenant.entity.js';
import { TenantId } from '@hetcho/shared';

function makeTenant() {
  return Tenant.create({
    id: TenantId('t1'),
    slug: 'demo',
    name: 'Demo Salon',
    type: 'salon_toc',
    workingHours: { mon: { open: '08:00', close: '22:00' }, sat: { open: '08:00', close: '22:00' } },
    peakWindows: [
      { day: 'sat', from: '14:00', to: '22:00' },
      { day: 'sun', from: '00:00', to: '23:59' },
    ],
    slotMinutes: 30,
    timezone: 'Asia/Ho_Chi_Minh',
    cancelPolicy: { refundFullHoursBefore: 24, finePercent: 50 },
  });
}

describe('Tenant.isPeakSlot', () => {
  it('detects peak on Saturday 14:00-22:00', () => {
    const tenant = makeTenant();
    // Saturday 15:00 = peak (note: getDay() = 6 = sat)
    const sat15 = new Date('2026-06-06T15:00:00+07:00');
    expect(tenant.isPeakSlot(sat15)).toBe(true);
  });

  it('NOT peak on Saturday morning', () => {
    const tenant = makeTenant();
    const sat10 = new Date('2026-06-06T10:00:00+07:00');
    expect(tenant.isPeakSlot(sat10)).toBe(false);
  });

  it('NOT peak on Monday', () => {
    const tenant = makeTenant();
    const mon15 = new Date('2026-06-01T15:00:00+07:00');
    expect(tenant.isPeakSlot(mon15)).toBe(false);
  });
});
