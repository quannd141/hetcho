import type {
  NotificationTemplate,
  NotificationTemplateRepository,
  NotificationTrigger,
} from '@hetcho/domain';
import type { NotificationTemplateId, TenantId } from '@hetcho/shared';

export class InMemoryNotificationTemplateRepository implements NotificationTemplateRepository {
  private store = new Map<string, NotificationTemplate>();

  async findById(id: NotificationTemplateId, tenantId: TenantId): Promise<NotificationTemplate | null> {
    const t = this.store.get(id);
    if (!t || t.tenantId !== tenantId) return null;
    return t;
  }

  async findByTrigger(tenantId: TenantId, trigger: NotificationTrigger): Promise<NotificationTemplate | null> {
    for (const t of this.store.values()) {
      if (t.tenantId === tenantId && t.trigger === trigger) return t;
    }
    return null;
  }

  async listByTenant(tenantId: TenantId): Promise<NotificationTemplate[]> {
    return [...this.store.values()]
      .filter((t) => t.tenantId === tenantId)
      .sort((a, b) => a.trigger.localeCompare(b.trigger));
  }

  async save(template: NotificationTemplate): Promise<void> {
    this.store.set(template.id, template);
  }

  reset(): void {
    this.store.clear();
  }
}
