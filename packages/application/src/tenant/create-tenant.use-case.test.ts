import { describe, it, expect, beforeEach } from 'vitest';
import { CreateTenantUseCase } from './create-tenant.use-case.js';
import { InMemoryTenantRepository, MockAuditLogger } from '@hetcho/infrastructure';
import { ConflictError, ValidationError } from '@hetcho/shared';

describe('CreateTenantUseCase', () => {
  let repo: InMemoryTenantRepository;
  let audit: MockAuditLogger;
  let useCase: CreateTenantUseCase;
  let idCounter = 0;

  beforeEach(() => {
    repo = new InMemoryTenantRepository();
    audit = new MockAuditLogger();
    idCounter = 0;
    useCase = new CreateTenantUseCase({
      tenants: repo,
      audit,
      now: () => new Date('2026-05-16T10:00:00Z'),
      generateId: () => `00000000-0000-0000-0000-${String(++idCounter).padStart(12, '0')}`,
    });
  });

  it('should create a tenant with defaults for salon_toc', async () => {
    const result = await useCase.execute({
      slug: 'salon-hang',
      name: 'Salon Hằng Hair',
      type: 'salon_toc',
      ownerEmail: 'hang@example.com',
    });
    expect(result.slug).toBe('salon-hang');
    expect(repo.size).toBe(1);
    expect(audit.events).toHaveLength(1);
    expect(audit.events[0]!.action).toBe('tenant.created');
  });

  it('should set spa working hours mon-sat 09:00-21:00, sun closed', async () => {
    await useCase.execute({
      slug: 'spa-mai',
      name: 'Mai Skin Spa',
      type: 'spa_skincare',
      ownerEmail: 'mai@example.com',
    });
    const tenant = await repo.findBySlug('spa-mai');
    expect(tenant).not.toBeNull();
    const props = tenant!.toJSON();
    expect(props.workingHours.sun).toBeNull();
    expect(props.workingHours.mon).toEqual({ open: '09:00', close: '21:00' });
    expect(props.slotMinutes).toBe(60);
  });

  it('should reject duplicate slug', async () => {
    await useCase.execute({
      slug: 'demo',
      name: 'First',
      type: 'salon_toc',
      ownerEmail: 'a@example.com',
    });
    await expect(
      useCase.execute({
        slug: 'demo',
        name: 'Second',
        type: 'spa_skincare',
        ownerEmail: 'b@example.com',
      }),
    ).rejects.toThrow(ConflictError);
  });

  it('should reject invalid slug (uppercase/special)', async () => {
    await expect(
      useCase.execute({
        slug: 'Salon-Hằng',
        name: 'Demo',
        type: 'salon_toc',
        ownerEmail: 'a@example.com',
      }),
    ).rejects.toThrow();
  });

  it('should reject invalid email', async () => {
    await expect(
      useCase.execute({
        slug: 'demo',
        name: 'Demo',
        type: 'salon_toc',
        ownerEmail: 'not-an-email',
      }),
    ).rejects.toThrow();
  });
});
