import { describe, it, expect, beforeEach } from 'vitest';
import { NotificationTemplate } from '@hetcho/domain';
import { NotificationTemplateId, TenantId } from '@hetcho/shared';
import { InMemoryNotificationTemplateRepository } from './in-memory-notification-template-repository.js';

const TENANT_A = TenantId('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
const TENANT_B = TenantId('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

function makeTemplate(id: string, trigger: 'customer.recovery_30d' | 'customer.recovery_60d', tenantId = TENANT_A) {
  return NotificationTemplate.create({
    id: NotificationTemplateId(id),
    tenantId,
    trigger,
    channel: 'zns',
    name: `tpl ${trigger}`,
    body: 'Hi {{customer.name}}',
  });
}

describe('InMemoryNotificationTemplateRepository', () => {
  let repo: InMemoryNotificationTemplateRepository;

  beforeEach(() => {
    repo = new InMemoryNotificationTemplateRepository();
  });

  it('save then findById round-trips for the owning tenant', async () => {
    const t = makeTemplate('11111111-1111-1111-1111-111111111111', 'customer.recovery_30d');
    await repo.save(t);
    expect(await repo.findById(t.id, TENANT_A)).toBe(t);
  });

  it('findById returns null when the tenantId mismatches', async () => {
    const t = makeTemplate('11111111-1111-1111-1111-111111111111', 'customer.recovery_30d');
    await repo.save(t);
    expect(await repo.findById(t.id, TENANT_B)).toBeNull();
  });

  it('findByTrigger returns the matching tenant template', async () => {
    await repo.save(makeTemplate('11111111-1111-1111-1111-111111111111', 'customer.recovery_30d'));
    await repo.save(makeTemplate('22222222-2222-2222-2222-222222222222', 'customer.recovery_60d'));
    const found = await repo.findByTrigger(TENANT_A, 'customer.recovery_60d');
    expect(found?.trigger).toBe('customer.recovery_60d');
  });

  it('findByTrigger isolates by tenant', async () => {
    await repo.save(makeTemplate('11111111-1111-1111-1111-111111111111', 'customer.recovery_30d', TENANT_A));
    expect(await repo.findByTrigger(TENANT_B, 'customer.recovery_30d')).toBeNull();
  });

  it('listByTenant returns only that tenant sorted by trigger', async () => {
    await repo.save(makeTemplate('11111111-1111-1111-1111-111111111111', 'customer.recovery_60d', TENANT_A));
    await repo.save(makeTemplate('22222222-2222-2222-2222-222222222222', 'customer.recovery_30d', TENANT_A));
    await repo.save(makeTemplate('33333333-3333-3333-3333-333333333333', 'customer.recovery_30d', TENANT_B));
    const result = await repo.listByTenant(TENANT_A);
    expect(result.map((t) => t.trigger)).toEqual(['customer.recovery_30d', 'customer.recovery_60d']);
  });
});
