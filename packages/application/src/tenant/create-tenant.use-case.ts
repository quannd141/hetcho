import { z } from 'zod';
import { Tenant, type TenantType } from '@hetcho/domain';
import { ConflictError, TenantId, ValidationError } from '@hetcho/shared';
import type { AuditLogger } from '../booking/ports.js';
import type { TenantWriteRepository } from './ports.js';

const TENANT_TYPES: readonly TenantType[] = [
  'salon_toc',
  'spa_skincare',
  'nail',
  'goi_dau',
  'barber',
  'massage',
  'other',
];

export const CreateTenantInput = z.object({
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphen'),
  name: z.string().min(1).max(200),
  type: z.enum(TENANT_TYPES as unknown as [TenantType, ...TenantType[]]),
  ownerEmail: z.string().email(),
  phoneContact: z.string().optional(),
});
export type CreateTenantInput = z.infer<typeof CreateTenantInput>;

export interface CreateTenantResult {
  tenantId: TenantId;
  slug: string;
}

/**
 * Onboarding step 1: tạo tenant mới với default settings.
 *
 * Slot defaults theo tenant type (chủ tiệm có thể override settings sau):
 * - salon_toc / barber / goi_dau: working_hours mon-sun 08:00-22:00, slot 30m
 * - spa_skincare / massage: mon-sat 09:00-21:00, slot 60m
 * - nail: mon-sun 09:00-22:00, slot 30m
 */
export class CreateTenantUseCase {
  constructor(
    private readonly deps: {
      tenants: TenantWriteRepository;
      audit: AuditLogger;
      now: () => Date;
      generateId: () => string;
    },
  ) {}

  async execute(rawInput: unknown): Promise<CreateTenantResult> {
    const input = CreateTenantInput.parse(rawInput);

    const existing = await this.deps.tenants.findBySlug(input.slug);
    if (existing) {
      throw new ConflictError(`Slug "${input.slug}" already taken`, { slug: input.slug });
    }

    const tenantId = TenantId(this.deps.generateId());
    const defaults = defaultsForType(input.type);

    const tenant = Tenant.create({
      id: tenantId,
      slug: input.slug,
      name: input.name,
      type: input.type,
      workingHours: defaults.workingHours,
      peakWindows: defaults.peakWindows,
      slotMinutes: defaults.slotMinutes,
      timezone: 'Asia/Ho_Chi_Minh',
      cancelPolicy: { refundFullHoursBefore: 24, finePercent: 50 },
    });

    await this.deps.tenants.save(tenant);
    await this.deps.audit.log({
      tenantId,
      actorType: 'owner',
      action: 'tenant.created',
      entity: 'tenant',
      entityId: tenantId,
      payload: { slug: input.slug, type: input.type, ownerEmail: input.ownerEmail },
    });

    return { tenantId, slug: input.slug };
  }
}

function defaultsForType(type: TenantType) {
  switch (type) {
    case 'spa_skincare':
    case 'massage':
      return {
        workingHours: {
          mon: { open: '09:00', close: '21:00' },
          tue: { open: '09:00', close: '21:00' },
          wed: { open: '09:00', close: '21:00' },
          thu: { open: '09:00', close: '21:00' },
          fri: { open: '09:00', close: '21:00' },
          sat: { open: '09:00', close: '21:00' },
          sun: null,
        },
        peakWindows: [{ day: 'sat' as const, from: '14:00', to: '21:00' }],
        slotMinutes: 60,
      };
    case 'nail':
      return {
        workingHours: openAllWeek('09:00', '22:00'),
        peakWindows: [
          { day: 'sat' as const, from: '14:00', to: '22:00' },
          { day: 'sun' as const, from: '10:00', to: '22:00' },
        ],
        slotMinutes: 30,
      };
    default:
      return {
        workingHours: openAllWeek('08:00', '22:00'),
        peakWindows: [
          { day: 'sat' as const, from: '14:00', to: '22:00' },
          { day: 'sun' as const, from: '10:00', to: '22:00' },
        ],
        slotMinutes: 30,
      };
  }
}

function openAllWeek(open: string, close: string) {
  return {
    mon: { open, close },
    tue: { open, close },
    wed: { open, close },
    thu: { open, close },
    fri: { open, close },
    sat: { open, close },
    sun: { open, close },
  };
}
