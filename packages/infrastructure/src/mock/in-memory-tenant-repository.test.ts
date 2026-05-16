import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryTenantRepository } from './in-memory-tenant-repository.js';
import { Tenant } from '@hetcho/domain';
import { TenantId } from '@hetcho/shared';

function makeTenant(id: string, slug: string) {
  return Tenant.create({
    id: TenantId(id),
    slug,
    name: `Tiệm ${slug}`,
    type: 'salon_toc',
    workingHours: { mon: { open: '08:00', close: '22:00' } },
    peakWindows: [],
    slotMinutes: 30,
    timezone: 'Asia/Ho_Chi_Minh',
    cancelPolicy: { refundFullHoursBefore: 24, finePercent: 50 },
  });
}

describe('InMemoryTenantRepository', () => {
  let repo: InMemoryTenantRepository;

  beforeEach(() => {
    repo = new InMemoryTenantRepository();
  });

  it('save + findById round trip', async () => {
    const t = makeTenant('t1', 'demo');
    await repo.save(t);
    expect(await repo.findById(TenantId('t1'))).toBe(t);
  });

  it('findBySlug returns same tenant', async () => {
    const t = makeTenant('t1', 'demo');
    await repo.save(t);
    expect(await repo.findBySlug('demo')).toBe(t);
  });

  it('returns null for unknown id', async () => {
    expect(await repo.findById(TenantId('unknown'))).toBeNull();
  });

  it('reset clears all', async () => {
    await repo.save(makeTenant('t1', 'a'));
    await repo.save(makeTenant('t2', 'b'));
    repo.reset();
    expect(repo.size).toBe(0);
  });
});
