import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { Customer } from '@hetcho/domain';
import { CustomerId, TenantId as TenantIdBrand } from '@hetcho/shared';
import { getContainerReady } from './container';

const COOKIE_NAME = 'hetcho_customer';
const COOKIE_DAYS = 30;

interface CustomerCookie {
  phone: string;
  name?: string;
  tenantBindings: Record<string, string>;
}

function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return phone.slice(0, 2) + '***' + phone.slice(-4);
}

function hashPhone(phone: string): string {
  return createHash('sha256').update(phone).digest('hex');
}

export function readCustomerCookie(): CustomerCookie | null {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as CustomerCookie;
  } catch {
    return null;
  }
}

export function writeCustomerCookie(data: CustomerCookie): void {
  cookies().set(COOKIE_NAME, encodeURIComponent(JSON.stringify(data)), {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_DAYS * 24 * 60 * 60,
  });
}

export async function ensureCustomerForTenant(input: {
  tenantSlug: string;
  phone: string;
  name: string;
}): Promise<{ customerId: CustomerId; created: boolean }> {
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(input.tenantSlug);
  if (!tenant) throw new Error(`Tenant not found: ${input.tenantSlug}`);

  const tenantId = TenantIdBrand(tenant.id);
  const phoneHash = hashPhone(input.phone);
  const existing = await c.customers.findByPhoneHash(tenantId, phoneHash);
  if (existing) {
    persistSession(input.tenantSlug, existing.id, input);
    return { customerId: existing.id, created: false };
  }

  const customerId = CustomerId(randomUUID());
  const customer = Customer.create({
    id: customerId,
    tenantId,
    name: input.name,
    phoneHash,
    phoneMasked: maskPhone(input.phone),
    zaloId: null,
    tier: 'normal',
    totalBookings: 0,
    lifetimeSpendVnd: 0,
  });
  await c.customers.save(customer);
  persistSession(input.tenantSlug, customerId, input);
  return { customerId, created: true };
}

function persistSession(tenantSlug: string, customerId: string, input: { phone: string; name: string }) {
  const cookie = readCustomerCookie() ?? { phone: input.phone, name: input.name, tenantBindings: {} };
  cookie.phone = input.phone;
  cookie.name = input.name;
  cookie.tenantBindings[tenantSlug] = customerId;
  writeCustomerCookie(cookie);
}

export function clearCustomerSession(): void {
  cookies().delete(COOKIE_NAME);
}

export function getBoundCustomerId(tenantSlug: string): string | null {
  const cookie = readCustomerCookie();
  return cookie?.tenantBindings[tenantSlug] ?? null;
}
