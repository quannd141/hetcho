import { z } from 'zod';
import {
  NotFoundError,
  NotificationTemplateId,
  TenantId,
  ValidationError,
} from '@hetcho/shared';
import { NotificationTemplate } from '@hetcho/domain';
import type { NotificationTemplateDependencies } from './ports.js';

const TRIGGERS = [
  'booking.confirmed',
  'reminder.t_minus_24h',
  'reminder.t_minus_2h',
  'booking.completed',
  'package.expiring_soon',
  'customer.recovery_30d',
  'customer.recovery_60d',
  'customer.recovery_90d',
] as const;

export const SaveTemplateInput = z.object({
  tenantId: z.string().uuid(),
  trigger: z.enum(TRIGGERS),
  channel: z.enum(['zns', 'oa_broadcast']).default('zns'),
  name: z.string().min(1),
  body: z.string().min(1),
  isActive: z.boolean().optional(),
  actorType: z.enum(['owner', 'staff']).default('owner'),
  actorId: z.string().optional(),
});
export type SaveTemplateInput = z.infer<typeof SaveTemplateInput>;

export interface SaveTemplateResult {
  templateId: NotificationTemplateId;
  created: boolean;
}

/**
 * Upsert a tenant's template for a specific trigger.
 * One template per (tenant, trigger) — dispatchers look up by trigger.
 */
export class SaveTemplateUseCase {
  constructor(private readonly deps: NotificationTemplateDependencies) {}

  async execute(rawInput: unknown): Promise<SaveTemplateResult> {
    const input = SaveTemplateInput.parse(rawInput);
    const tenantId = TenantId(input.tenantId);
    const tenant = await this.deps.tenants.findById(tenantId);
    if (!tenant) throw new NotFoundError('Tenant not found');

    const now = this.deps.now();
    const existing = await this.deps.templates.findByTrigger(tenantId, input.trigger);

    if (existing) {
      existing.rename(input.name, now);
      existing.updateBody(input.body, now);
      if (input.isActive === true) existing.activate(now);
      if (input.isActive === false) existing.deactivate(now);
      await this.deps.templates.save(existing);
      await this.deps.audit.log({
        tenantId,
        actorType: input.actorType,
        ...(input.actorId !== undefined ? { actorId: input.actorId } : {}),
        action: 'notification_template.updated',
        entity: 'notification_template',
        entityId: existing.id,
        payload: { trigger: input.trigger, channel: existing.channel },
      });
      return { templateId: existing.id, created: false };
    }

    const id = NotificationTemplateId(this.deps.generateId());
    const template = NotificationTemplate.create({
      id,
      tenantId,
      trigger: input.trigger,
      channel: input.channel,
      name: input.name,
      body: input.body,
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      createdAt: now,
      updatedAt: now,
    });
    await this.deps.templates.save(template);
    await this.deps.audit.log({
      tenantId,
      actorType: input.actorType,
      ...(input.actorId !== undefined ? { actorId: input.actorId } : {}),
      action: 'notification_template.created',
      entity: 'notification_template',
      entityId: id,
      payload: { trigger: input.trigger, channel: input.channel },
    });
    return { templateId: id, created: true };
  }
}

// Helper exports for completeness — surface validation error via Zod parse.
export { ValidationError };
