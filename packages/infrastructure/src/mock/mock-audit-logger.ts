import type { AuditEntryView, AuditListFilter, AuditLogger } from '@hetcho/application';
import { type TenantId, logger } from '@hetcho/shared';

interface AuditEntry {
  tenantId: string;
  actorType: 'customer' | 'owner' | 'staff' | 'system';
  actorId?: string;
  action: string;
  entity: string;
  entityId: string;
  payload?: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Mock audit logger — append in-memory + log JSON.
 * Production: replace với DrizzleAuditLogger ghi vào table audit_events.
 */
export class MockAuditLogger implements AuditLogger {
  public readonly events: AuditEntry[] = [];

  async log(input: {
    tenantId: string;
    actorType: 'customer' | 'owner' | 'staff' | 'system';
    actorId?: string;
    action: string;
    entity: string;
    entityId: string;
    payload?: Record<string, unknown>;
  }): Promise<void> {
    const entry: AuditEntry = { ...input, createdAt: new Date() };
    this.events.push(entry);
    logger.info('[AUDIT]', { ...entry });
  }

  async list(filter: AuditListFilter): Promise<AuditEntryView[]> {
    const limit = filter.limit ?? 200;
    const matches = this.events.filter((e) => {
      if (e.tenantId !== filter.tenantId) return false;
      if (filter.action && e.action !== filter.action) return false;
      if (filter.entity && e.entity !== filter.entity) return false;
      if (filter.from && e.createdAt < filter.from) return false;
      if (filter.to && e.createdAt > filter.to) return false;
      return true;
    });
    matches.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return matches.slice(0, limit).map((e) => ({
      tenantId: e.tenantId as TenantId,
      actorType: e.actorType,
      ...(e.actorId !== undefined ? { actorId: e.actorId } : {}),
      action: e.action,
      entity: e.entity,
      entityId: e.entityId,
      ...(e.payload !== undefined ? { payload: e.payload } : {}),
      createdAt: e.createdAt,
    }));
  }

  reset(): void {
    this.events.length = 0;
  }
}
