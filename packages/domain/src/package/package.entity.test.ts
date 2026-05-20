import { describe, it, expect } from 'vitest';
import { PackageId, ServiceId, TenantId } from '@hetcho/shared';
import { Package } from './package.entity.js';

const PKG_ID = PackageId('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
const TENANT = TenantId('11111111-1111-1111-1111-111111111111');
const SERVICE = ServiceId('22222222-2222-2222-2222-222222222222');

describe('Package entity', () => {
  it('creates active by default with trimmed name', () => {
    const p = Package.create({
      id: PKG_ID,
      tenantId: TENANT,
      serviceId: SERVICE,
      name: '  Gói 10 buổi facial  ',
      totalSessions: 10,
      priceVnd: 5_000_000,
      validityDays: 180,
    });
    expect(p.isActive).toBe(true);
    expect(p.toJSON().name).toBe('Gói 10 buổi facial');
  });

  it.each([
    ['empty name', { name: ' ' }],
    ['zero totalSessions', { totalSessions: 0 }],
    ['negative price', { priceVnd: -1 }],
    ['zero validityDays', { validityDays: 0 }],
    ['fractional totalSessions', { totalSessions: 1.5 }],
  ])('rejects invalid input: %s', (_label, overrides) => {
    expect(() =>
      Package.create({
        id: PKG_ID,
        tenantId: TENANT,
        serviceId: SERVICE,
        name: 'OK',
        totalSessions: 10,
        priceVnd: 1_000_000,
        validityDays: 90,
        ...overrides,
      }),
    ).toThrow();
  });

  it('deactivate toggles isActive once; second call throws', () => {
    const p = Package.create({
      id: PKG_ID,
      tenantId: TENANT,
      serviceId: SERVICE,
      name: 'X',
      totalSessions: 5,
      priceVnd: 1_000_000,
      validityDays: 30,
    });
    p.deactivate();
    expect(p.isActive).toBe(false);
    expect(() => p.deactivate()).toThrow(/already inactive/);
  });
});
