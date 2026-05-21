import type { NotificationTemplateId, TenantId } from '@hetcho/shared';
import type { NotificationTemplate, NotificationTrigger } from './notification-template.entity.js';

export interface NotificationTemplateRepository {
  findById(id: NotificationTemplateId, tenantId: TenantId): Promise<NotificationTemplate | null>;
  findByTrigger(tenantId: TenantId, trigger: NotificationTrigger): Promise<NotificationTemplate | null>;
  listByTenant(tenantId: TenantId): Promise<NotificationTemplate[]>;
  save(template: NotificationTemplate): Promise<void>;
}
