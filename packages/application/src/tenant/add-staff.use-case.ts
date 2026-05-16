import { z } from 'zod';
import { NotFoundError, ServiceId, StaffId, TenantId, ValidationError } from '@hetcho/shared';
import type { AuditLogger } from '../booking/ports.js';
import type { ServiceWriteRepository, StaffWriteRepository, TenantWriteRepository } from './ports.js';

const TimeStr = z.string().regex(/^\d{2}:\d{2}$/);

export const AddStaffInput = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(200),
  photoUrl: z.string().url().optional(),
  serviceIds: z.array(z.string().uuid()).min(1),
  workingHours: z.record(
    z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']),
    z
      .object({ open: TimeStr, close: TimeStr })
      .nullable(),
  ),
});
export type AddStaffInput = z.infer<typeof AddStaffInput>;

export interface AddStaffResult {
  staffId: StaffId;
}

export class AddStaffUseCase {
  constructor(
    private readonly deps: {
      tenants: TenantWriteRepository;
      services: ServiceWriteRepository;
      staff: StaffWriteRepository;
      audit: AuditLogger;
      generateId: () => string;
    },
  ) {}

  async execute(rawInput: unknown): Promise<AddStaffResult> {
    const input = AddStaffInput.parse(rawInput);
    const tenantId = TenantId(input.tenantId);

    const tenant = await this.deps.tenants.findById(tenantId);
    if (!tenant) throw new NotFoundError('Tenant not found');

    for (const sid of input.serviceIds) {
      const found = await this.deps.services.findById(ServiceId(sid), tenantId);
      if (!found) {
        throw new ValidationError(`Service ${sid} does not belong to tenant ${tenantId}`);
      }
    }

    const staffId = StaffId(this.deps.generateId());
    await this.deps.staff.save({
      id: staffId,
      tenantId,
      name: input.name,
      photoUrl: input.photoUrl,
      workingHours: input.workingHours,
      serviceIds: input.serviceIds,
      isActive: true,
    });

    await this.deps.audit.log({
      tenantId,
      actorType: 'owner',
      action: 'staff.added',
      entity: 'staff',
      entityId: staffId,
      payload: { name: input.name, serviceCount: input.serviceIds.length },
    });

    return { staffId };
  }
}
