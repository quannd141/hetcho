import type { NotificationTemplateRepository } from '@hetcho/domain';
import type { AuditLogger, TenantRepository } from '../booking/ports.js';

export type { NotificationTemplateRepository, TenantRepository };

export interface NotificationTemplateDependencies {
  tenants: TenantRepository;
  templates: NotificationTemplateRepository;
  audit: AuditLogger;
  now: () => Date;
  generateId: () => string;
}
