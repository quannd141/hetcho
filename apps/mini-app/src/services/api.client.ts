const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3300/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

async function call<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success || !json.data) {
    throw new Error(json.error?.message ?? 'API error');
  }
  return json.data;
}

export async function fetchServices(tenantSlug: string) {
  return call<Array<{ id: string; name: string; durationMinutes: number; priceVnd: number; category?: string }>>(
    `/public/tenants/${tenantSlug}/services`,
  );
}

export async function fetchAvailability(
  tenantSlug: string,
  params: { date: string; serviceId: string; staffId?: string },
) {
  const qs = new URLSearchParams(params).toString();
  return call<{ tenantSlug: string; date: string; slots: Array<{ startAt: string; available: boolean }> }>(
    `/public/tenants/${tenantSlug}/availability?${qs}`,
  );
}
