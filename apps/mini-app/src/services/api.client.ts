const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3300/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success || json.data === undefined) {
    throw new Error(json.error?.message ?? `API error (${res.status})`);
  }
  return json.data;
}

export interface TenantDto {
  id: string;
  slug: string;
  name: string;
  type: string;
  slotMinutes: number;
  timezone: string;
  workingHours: Record<string, { open: string; close: string } | null>;
  peakWindows: Array<{ day: string; from: string; to: string }>;
  cancelPolicy: { refundFullHoursBefore: number; finePercent: number };
}

export interface ServiceDto {
  id: string;
  name: string;
  category?: string;
  durationMinutes: number;
  priceVnd: number;
  depositNormalVnd: number;
  depositPeakVnd: number;
}

export interface StaffDto {
  id: string;
  name: string;
  photoUrl?: string;
  serviceIds: string[];
}

export interface AvailabilitySlotDto {
  startAt: string;
  endAt: string;
  available: boolean;
  isPeak: boolean;
}

export interface MyBookingDto {
  bookingId: string;
  status: string;
  startAt: string;
  endAt: string;
  serviceName: string;
  finalPriceVnd: number | null;
}

export interface CreateBookingResultDto {
  bookingId: string;
  status: 'pending' | 'confirmed';
  requiresPayment: boolean;
  paymentUrl?: string;
}

export const api = {
  tenant: (slug: string) => call<TenantDto>(`/public/tenants/${slug}`),
  services: (slug: string) => call<ServiceDto[]>(`/public/tenants/${slug}/services`),
  staff: (slug: string, serviceId?: string) =>
    call<StaffDto[]>(`/public/tenants/${slug}/staff${serviceId ? `?serviceId=${serviceId}` : ''}`),
  availability: (slug: string, params: { date: string; serviceId: string }) => {
    const qs = new URLSearchParams(params).toString();
    return call<{ tenantSlug: string; date: string; slots: AvailabilitySlotDto[] }>(
      `/public/tenants/${slug}/availability?${qs}`,
    );
  },
  createBooking: (
    slug: string,
    body: {
      serviceId: string;
      staffId: string;
      startAt: string;
      customer: { name: string; phone: string };
    },
  ) =>
    call<CreateBookingResultDto>(`/public/tenants/${slug}/bookings`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  myBookings: (slug: string) =>
    call<{ bookings: MyBookingDto[] }>(`/public/tenants/${slug}/bookings`),
  confirmMock: (slug: string, bookingId: string) =>
    call<{ bookingId: string; alreadyConfirmed: boolean }>(
      `/public/tenants/${slug}/bookings/${bookingId}/confirm-mock`,
      { method: 'POST' },
    ),
  bookingDetail: (slug: string, bookingId: string) =>
    call<BookingDetailDto>(`/public/tenants/${slug}/bookings/${bookingId}`),
  cancelBooking: (slug: string, bookingId: string) =>
    call<{ bookingId: string; refundAmountVnd: number }>(
      `/public/tenants/${slug}/bookings/${bookingId}`,
      { method: 'DELETE' },
    ),
};

export interface BookingDetailDto {
  bookingId: string;
  status: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  serviceName: string;
  servicePriceVnd: number;
  staffName: string;
  depositRequiredVnd: number;
  depositPaidVnd: number;
  finalPriceVnd: number | null;
  isPeakSlot: boolean;
  tenantName: string;
}
