import 'server-only';
import { notFound } from 'next/navigation';
import { ListBookingsForDateUseCase } from '@hetcho/application';
import type { TenantId } from '@hetcho/shared';
import type { Tenant } from '@hetcho/domain';
import { getContainerReady } from './container';

export interface TenantContext {
  tenant: Tenant;
  tenantId: TenantId;
  slug: string;
}

export async function loadTenantBySlug(slug: string): Promise<TenantContext> {
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(slug);
  if (!tenant) notFound();
  return { tenant, tenantId: tenant.id, slug };
}

export async function listServices(slug: string) {
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(slug);
  if (!tenant) notFound();
  const services = await c.services.findByTenant(tenant.id);
  return services.map((s) => s.toJSON());
}

export async function listStaff(slug: string) {
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(slug);
  if (!tenant) notFound();
  return c.staff.findByTenant(tenant.id);
}

export async function listBookingsByDate(slug: string, date: Date) {
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(slug);
  if (!tenant) notFound();
  const useCase = new ListBookingsForDateUseCase({
    bookings: c.bookings,
    services: c.services,
    staff: c.staff,
    customers: c.customers,
  });
  return useCase.execute({ tenantId: tenant.id, date });
}

export async function findServiceById(slug: string, serviceId: string) {
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(slug);
  if (!tenant) notFound();
  // findById signature: (id, tenantId) — bypass strict typing via cast
  const service = await c.services.findById(
    serviceId as never,
    tenant.id,
  );
  return service?.toJSON() ?? null;
}
