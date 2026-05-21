import { describe, it, expect, beforeEach } from 'vitest';
import { TenantId } from '@hetcho/shared';
import { MockAuditLogger } from './mock-audit-logger.js';

const TENANT_A = TenantId('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
const TENANT_B = TenantId('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

describe('MockAuditLogger.list', () => {
  let audit: MockAuditLogger;

  beforeEach(() => {
    audit = new MockAuditLogger();
  });

  it('should return only entries for the requested tenant', async () => {
    await audit.log({ tenantId: TENANT_A, actorType: 'system', action: 'x.y', entity: 'x', entityId: '1' });
    await audit.log({ tenantId: TENANT_B, actorType: 'system', action: 'x.y', entity: 'x', entityId: '2' });
    const result = await audit.list({ tenantId: TENANT_A });
    expect(result).toHaveLength(1);
    expect(result[0]?.entityId).toBe('1');
  });

  it('should filter by action', async () => {
    await audit.log({ tenantId: TENANT_A, actorType: 'system', action: 'a.one', entity: 'x', entityId: '1' });
    await audit.log({ tenantId: TENANT_A, actorType: 'system', action: 'a.two', entity: 'x', entityId: '2' });
    const result = await audit.list({ tenantId: TENANT_A, action: 'a.two' });
    expect(result.map((e) => e.entityId)).toEqual(['2']);
  });

  it('should sort newest first', async () => {
    await audit.log({ tenantId: TENANT_A, actorType: 'system', action: 'x', entity: 'x', entityId: '1' });
    await new Promise((r) => setTimeout(r, 2));
    await audit.log({ tenantId: TENANT_A, actorType: 'system', action: 'x', entity: 'x', entityId: '2' });
    const result = await audit.list({ tenantId: TENANT_A });
    expect(result.map((e) => e.entityId)).toEqual(['2', '1']);
  });

  it('should respect limit', async () => {
    for (let i = 0; i < 5; i++) {
      await audit.log({ tenantId: TENANT_A, actorType: 'system', action: 'x', entity: 'x', entityId: String(i) });
    }
    const result = await audit.list({ tenantId: TENANT_A, limit: 2 });
    expect(result).toHaveLength(2);
  });

  it('should filter by date range', async () => {
    const old = new MockAuditLogger();
    await old.log({ tenantId: TENANT_A, actorType: 'system', action: 'x', entity: 'x', entityId: '1' });
    // mutate one entry to be old
    old.events[0]!.createdAt = new Date('2026-01-01T00:00:00Z');
    await old.log({ tenantId: TENANT_A, actorType: 'system', action: 'x', entity: 'x', entityId: '2' });

    const recentOnly = await old.list({
      tenantId: TENANT_A,
      from: new Date('2026-05-01T00:00:00Z'),
    });
    expect(recentOnly.map((e) => e.entityId)).toEqual(['2']);
  });
});
