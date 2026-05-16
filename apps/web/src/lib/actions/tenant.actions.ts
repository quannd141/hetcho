'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import {
  AddServiceUseCase,
  AddStaffUseCase,
  CreateTenantUseCase,
} from '@hetcho/application';
import { getContainerReady } from '../container';

interface ActionResult {
  ok: boolean;
  error?: string;
  redirectTo?: string;
}

export async function createTenantAction(formData: FormData): Promise<void> {
  const c = await getContainerReady();
  const useCase = new CreateTenantUseCase({
    tenants: c.tenants,
    audit: c.audit,
    now: () => new Date(),
    generateId: () => randomUUID(),
  });

  const slug = String(formData.get('slug') ?? '').trim().toLowerCase();
  const name = String(formData.get('name') ?? '').trim();
  const type = String(formData.get('type') ?? 'salon_toc');
  const ownerEmail = String(formData.get('email') ?? '').trim();

  try {
    const result = await useCase.execute({ slug, name, type, ownerEmail });
    cookies().set('hetcho_owner_email', ownerEmail, { httpOnly: false, sameSite: 'lax', path: '/' });
    cookies().set('hetcho_tenant_slug', result.slug, { httpOnly: false, sameSite: 'lax', path: '/' });
    revalidatePath('/');
  } catch (err) {
    redirect(`/signup?error=${encodeURIComponent((err as Error).message)}`);
  }

  redirect(`/${slug}/dashboard?welcome=1`);
}

export async function addServiceAction(formData: FormData): Promise<void> {
  const slug = String(formData.get('slug') ?? '');
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(slug);
  if (!tenant) redirect(`/?error=tenant-not-found`);

  const useCase = new AddServiceUseCase({
    tenants: c.tenants,
    services: c.services,
    audit: c.audit,
    generateId: () => randomUUID(),
  });

  try {
    await useCase.execute({
      tenantId: tenant.id,
      name: String(formData.get('name') ?? ''),
      category: String(formData.get('category') ?? '') || undefined,
      durationMinutes: Number(formData.get('duration') ?? 30),
      priceVnd: Number(formData.get('priceVnd') ?? 0),
      depositNormalVnd: Number(formData.get('depositNormal') ?? 0),
      depositPeakVnd: Number(formData.get('depositPeak') ?? 0),
    });
    revalidatePath(`/${slug}/services`);
  } catch (err) {
    redirect(`/${slug}/services/new?error=${encodeURIComponent((err as Error).message)}`);
  }

  redirect(`/${slug}/services?created=1`);
}

export async function addStaffAction(formData: FormData): Promise<void> {
  const slug = String(formData.get('slug') ?? '');
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(slug);
  if (!tenant) redirect(`/?error=tenant-not-found`);

  const services = await c.services.findByTenant(tenant.id);
  if (services.length === 0) {
    redirect(`/${slug}/services/new?error=add-service-first`);
  }

  // Multi-select services from checkboxes
  const serviceIds = formData.getAll('serviceIds').map(String).filter(Boolean);
  const finalServiceIds = serviceIds.length > 0 ? serviceIds : [services[0].id];

  const useCase = new AddStaffUseCase({
    tenants: c.tenants,
    services: c.services,
    staff: c.staff,
    audit: c.audit,
    generateId: () => randomUUID(),
  });

  try {
    await useCase.execute({
      tenantId: tenant.id,
      name: String(formData.get('name') ?? ''),
      serviceIds: finalServiceIds,
      workingHours: {
        mon: { open: '08:00', close: '22:00' },
        tue: { open: '08:00', close: '22:00' },
        wed: { open: '08:00', close: '22:00' },
        thu: { open: '08:00', close: '22:00' },
        fri: { open: '08:00', close: '22:00' },
        sat: { open: '08:00', close: '22:00' },
        sun: { open: '08:00', close: '22:00' },
      },
    });
    revalidatePath(`/${slug}/staff`);
  } catch (err) {
    redirect(`/${slug}/staff/new?error=${encodeURIComponent((err as Error).message)}`);
  }

  redirect(`/${slug}/staff?created=1`);
}
