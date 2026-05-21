import { describe, it, expect, beforeEach } from 'vitest';
import { Tenant, NotificationTemplate } from '@hetcho/domain';
import { NotFoundError, TenantId, ValidationError } from '@hetcho/shared';
import {
  InMemoryNotificationTemplateRepository,
  InMemoryTenantRepository,
  MockAuditLogger,
} from '@hetcho/infrastructure';
import { SaveTemplateUseCase } from './save-template.use-case.js';
import { GetTemplatesByTenantUseCase } from './get-templates-by-tenant.use-case.js';
import type { NotificationTemplateDependencies } from './ports.js';

const TENANT_ID_STR = '11111111-1111-1111-1111-111111111111';
const TENANT = TenantId(TENANT_ID_STR);

function makeTenant(): Tenant {
  return Tenant.create({
    id: TENANT,
    slug: 'demo',
    name: 'Demo Salon',
    type: 'salon_toc',
    workingHours: { mon: { open: '09:00', close: '21:00' } },
    peakWindows: [],
    slotMinutes: 30,
    timezone: 'Asia/Ho_Chi_Minh',
    cancelPolicy: { refundFullHoursBefore: 24, finePercent: 50 },
  });
}

async function buildDeps() {
  const tenants = new InMemoryTenantRepository();
  const templates = new InMemoryNotificationTemplateRepository();
  const audit = new MockAuditLogger();
  await tenants.save(makeTenant());
  let counter = 0;
  const deps: NotificationTemplateDependencies = {
    tenants,
    templates,
    audit,
    now: () => new Date('2026-05-21T08:00:00Z'),
    generateId: () => `gen-${++counter}`.padEnd(36, '0'),
  };
  return { deps, tenants, templates, audit };
}

describe('SaveTemplateUseCase', () => {
  let deps: NotificationTemplateDependencies;
  let templates: InMemoryNotificationTemplateRepository;
  let audit: MockAuditLogger;

  beforeEach(async () => {
    ({ deps, templates, audit } = await buildDeps());
  });

  it('creates a new template when none exists for trigger', async () => {
    const uc = new SaveTemplateUseCase(deps);
    const result = await uc.execute({
      tenantId: TENANT_ID_STR,
      trigger: 'customer.recovery_30d',
      channel: 'zns',
      name: 'Recovery 30 ngày',
      body: 'Chào {{customer.name}}, lâu rồi không gặp!',
    });
    expect(result.created).toBe(true);

    const stored = await templates.findByTrigger(TENANT, 'customer.recovery_30d');
    expect(stored?.body).toContain('lâu rồi');
    expect(audit.events.map((e) => e.action)).toContain('notification_template.created');
  });

  it('updates an existing template instead of creating a duplicate', async () => {
    const uc = new SaveTemplateUseCase(deps);
    const first = await uc.execute({
      tenantId: TENANT_ID_STR,
      trigger: 'customer.recovery_30d',
      channel: 'zns',
      name: 'v1',
      body: 'old body',
    });
    const second = await uc.execute({
      tenantId: TENANT_ID_STR,
      trigger: 'customer.recovery_30d',
      channel: 'zns',
      name: 'v2',
      body: 'new body',
    });
    expect(second.created).toBe(false);
    expect(second.templateId).toBe(first.templateId);
    const list = await templates.listByTenant(TENANT);
    expect(list).toHaveLength(1);
    expect(list[0]?.body).toBe('new body');
    expect(list[0]?.name).toBe('v2');
    expect(audit.events.map((e) => e.action)).toEqual([
      'notification_template.created',
      'notification_template.updated',
    ]);
  });

  it('rejects unknown tenant', async () => {
    const uc = new SaveTemplateUseCase(deps);
    await expect(
      uc.execute({
        tenantId: '99999999-9999-9999-9999-999999999999',
        trigger: 'customer.recovery_30d',
        channel: 'zns',
        name: 'x',
        body: 'y',
      }),
    ).rejects.toThrow(NotFoundError);
  });

  it('rejects empty body via Zod', async () => {
    const uc = new SaveTemplateUseCase(deps);
    await expect(
      uc.execute({
        tenantId: TENANT_ID_STR,
        trigger: 'customer.recovery_30d',
        channel: 'zns',
        name: 'x',
        body: '',
      }),
    ).rejects.toThrow();
  });

  it('rejects unknown trigger', async () => {
    const uc = new SaveTemplateUseCase(deps);
    await expect(
      uc.execute({
        tenantId: TENANT_ID_STR,
        trigger: 'invalid.action',
        channel: 'zns',
        name: 'x',
        body: 'y',
      }),
    ).rejects.toThrow();
  });

  it('toggles isActive on update when supplied', async () => {
    const uc = new SaveTemplateUseCase(deps);
    await uc.execute({
      tenantId: TENANT_ID_STR,
      trigger: 'customer.recovery_30d',
      channel: 'zns',
      name: 'x',
      body: 'y',
    });
    await uc.execute({
      tenantId: TENANT_ID_STR,
      trigger: 'customer.recovery_30d',
      channel: 'zns',
      name: 'x',
      body: 'y',
      isActive: false,
    });
    const stored = await templates.findByTrigger(TENANT, 'customer.recovery_30d');
    expect(stored?.isActive).toBe(false);
  });
});

describe('GetTemplatesByTenantUseCase', () => {
  it('returns templates sorted by trigger with placeholders extracted', async () => {
    const { deps, templates } = await buildDeps();
    const t1 = NotificationTemplate.create({
      id: 'aaaa' as never,
      tenantId: TENANT,
      trigger: 'customer.recovery_60d',
      channel: 'zns',
      name: '60d',
      body: 'Hi {{customer.name}}',
    });
    const t2 = NotificationTemplate.create({
      id: 'bbbb' as never,
      tenantId: TENANT,
      trigger: 'customer.recovery_30d',
      channel: 'zns',
      name: '30d',
      body: 'Hi {{customer.name}}, missing you at {{tenant.name}}',
    });
    await templates.save(t1);
    await templates.save(t2);

    const uc = new GetTemplatesByTenantUseCase(deps);
    const result = await uc.execute({ tenantId: TENANT_ID_STR });

    expect(result.templates.map((t) => t.trigger)).toEqual([
      'customer.recovery_30d',
      'customer.recovery_60d',
    ]);
    expect(result.templates[0]?.placeholders.sort()).toEqual(['customer.name', 'tenant.name']);
  });

  it('rejects unknown tenant', async () => {
    const { deps } = await buildDeps();
    const uc = new GetTemplatesByTenantUseCase(deps);
    await expect(
      uc.execute({ tenantId: '99999999-9999-9999-9999-999999999999' }),
    ).rejects.toThrow(NotFoundError);
  });
});

// Quiet "unused import" guard for ValidationError (kept to make the relationship
// explicit in case future tests add direct entity-level assertions).
void ValidationError;
