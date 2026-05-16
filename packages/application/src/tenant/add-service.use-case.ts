import { z } from 'zod';
import { Service } from '@hetcho/domain';
import { NotFoundError, ServiceId, TenantId } from '@hetcho/shared';
import type { AuditLogger } from '../booking/ports.js';
import type { ServiceWriteRepository, TenantWriteRepository } from './ports.js';

export const AddServiceInput = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(200),
  category: z.string().optional(),
  durationMinutes: z.number().int().min(15).max(480),
  priceVnd: z.number().int().nonnegative(),
  depositNormalVnd: z.number().int().nonnegative().default(0),
  depositPeakVnd: z.number().int().nonnegative().default(0),
});
export type AddServiceInput = z.infer<typeof AddServiceInput>;

export interface AddServiceResult {
  serviceId: ServiceId;
}

export class AddServiceUseCase {
  constructor(
    private readonly deps: {
      tenants: TenantWriteRepository;
      services: ServiceWriteRepository;
      audit: AuditLogger;
      generateId: () => string;
    },
  ) {}

  async execute(rawInput: unknown): Promise<AddServiceResult> {
    const input = AddServiceInput.parse(rawInput);

    const tenant = await this.deps.tenants.findById(TenantId(input.tenantId));
    if (!tenant) throw new NotFoundError('Tenant not found');

    const serviceId = ServiceId(this.deps.generateId());
    const service = Service.create({
      id: serviceId,
      tenantId: TenantId(input.tenantId),
      name: input.name,
      durationMinutes: input.durationMinutes,
      priceVnd: input.priceVnd,
      depositNormalVnd: input.depositNormalVnd,
      depositPeakVnd: input.depositPeakVnd,
      category: input.category,
      isActive: true,
    });

    await this.deps.services.save(service);
    await this.deps.audit.log({
      tenantId: TenantId(input.tenantId),
      actorType: 'owner',
      action: 'service.added',
      entity: 'service',
      entityId: serviceId,
      payload: { name: input.name, priceVnd: input.priceVnd },
    });

    return { serviceId };
  }
}
