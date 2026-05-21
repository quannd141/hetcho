import { z } from 'zod';
import { NotFoundError, TenantId } from '@hetcho/shared';
import type { NotificationTemplate, NotificationTrigger } from '@hetcho/domain';
import type { NotificationTemplateDependencies } from './ports.js';

export const GetTemplatesByTenantInput = z.object({
  tenantId: z.string().uuid(),
});
export type GetTemplatesByTenantInput = z.infer<typeof GetTemplatesByTenantInput>;

export interface TemplateSummary {
  id: string;
  trigger: NotificationTrigger;
  channel: 'zns' | 'oa_broadcast';
  name: string;
  body: string;
  isActive: boolean;
  placeholders: string[];
  updatedAt: Date;
}

export class GetTemplatesByTenantUseCase {
  constructor(
    private readonly deps: Pick<NotificationTemplateDependencies, 'tenants' | 'templates'>,
  ) {}

  async execute(rawInput: unknown): Promise<{ templates: TemplateSummary[] }> {
    const input = GetTemplatesByTenantInput.parse(rawInput);
    const tenantId = TenantId(input.tenantId);
    const tenant = await this.deps.tenants.findById(tenantId);
    if (!tenant) throw new NotFoundError('Tenant not found');

    const list = await this.deps.templates.listByTenant(tenantId);
    return { templates: list.map(this.toSummary) };
  }

  private toSummary = (t: NotificationTemplate): TemplateSummary => ({
    id: t.id,
    trigger: t.trigger,
    channel: t.channel,
    name: t.name,
    body: t.body,
    isActive: t.isActive,
    placeholders: t.placeholders(),
    updatedAt: t.updatedAt,
  });
}
