import type { AuditLogger } from '@hetcho/application';
import { logger } from '@hetcho/shared';

interface AuditEntry {
  tenantId: string;
  actorType: string;
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

  reset(): void {
    this.events.length = 0;
  }
}
