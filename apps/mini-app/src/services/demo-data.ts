/**
 * Mock data for Mini App pages (no API call).
 * NIGHT_SHIFT_MODE only — swap with api.client.ts when PH-001 + PH-002 done.
 */

export interface ServiceVM {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  priceVnd: number;
  depositPeakVnd: number;
  description?: string;
}

export interface StaffVM {
  id: string;
  name: string;
  role: string;
  rating: number;
  bookingCount: number;
}

export interface BookingVM {
  id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  startAt: string;
  serviceName: string;
  staffName: string;
  priceVnd: number;
  depositPaidVnd: number;
  tenantSlug: string;
  tenantName: string;
}

export interface PackageProgressVM {
  id: string;
  name: string;
  tenantName: string;
  totalSessions: number;
  remaining: number;
  expiresAt: string;
  serviceName: string;
}

interface TenantVM {
  slug: string;
  name: string;
  type: string;
  address: string;
  rating: number;
  reviewCount: number;
  services: ServiceVM[];
  staff: StaffVM[];
}

const SALON_HANG: TenantVM = {
  slug: 'salon-hang',
  name: 'Salon Hằng Hair',
  type: 'Salon tóc',
  address: '123 Lê Lợi, Q.1, TP.HCM',
  rating: 4.8,
  reviewCount: 234,
  services: [
    { id: 'sv-1', name: 'Cắt + Gội + Sấy', category: 'Tóc', durationMinutes: 60, priceVnd: 250_000, depositPeakVnd: 50_000 },
    { id: 'sv-2', name: 'Nhuộm tóc', category: 'Tóc', durationMinutes: 180, priceVnd: 800_000, depositPeakVnd: 200_000, description: 'Bao gồm cắt + sấy.' },
    { id: 'sv-3', name: 'Uốn duỗi', category: 'Tóc', durationMinutes: 240, priceVnd: 1_200_000, depositPeakVnd: 300_000 },
  ],
  staff: [
    { id: 'st-1', name: 'Hằng (chủ)', role: 'Chủ tiệm', rating: 4.9, bookingCount: 1240 },
    { id: 'st-2', name: 'Stylist Tú', role: 'Stylist', rating: 4.7, bookingCount: 680 },
    { id: 'st-3', name: 'Stylist Ngọc', role: 'Stylist', rating: 4.6, bookingCount: 420 },
  ],
};

const MAI_SPA: TenantVM = {
  slug: 'mai-spa',
  name: 'Mai Skin Spa',
  type: 'Spa / Skincare',
  address: '88 Nguyễn Trãi, Q.5, TP.HCM',
  rating: 4.9,
  reviewCount: 178,
  services: [
    { id: 'sv-1', name: 'Treatment trắng da', category: 'Skincare', durationMinutes: 90, priceVnd: 800_000, depositPeakVnd: 200_000 },
    { id: 'sv-2', name: 'Massage trị liệu', category: 'Massage', durationMinutes: 60, priceVnd: 500_000, depositPeakVnd: 200_000 },
  ],
  staff: [
    { id: 'st-1', name: 'KTV Mai', role: 'KTV', rating: 4.9, bookingCount: 820 },
    { id: 'st-2', name: 'KTV Hân', role: 'KTV', rating: 4.8, bookingCount: 540 },
  ],
};

const LINH_NAIL: TenantVM = {
  slug: 'linh-nail',
  name: 'Linh Nail Studio',
  type: 'Nail',
  address: '45 Trần Hưng Đạo, Q.5, TP.HCM',
  rating: 4.7,
  reviewCount: 312,
  services: [
    { id: 'sv-1', name: 'Nail gel cơ bản', category: 'Nail', durationMinutes: 60, priceVnd: 250_000, depositPeakVnd: 50_000 },
    { id: 'sv-2', name: 'Nail vẽ thiết kế', category: 'Nail', durationMinutes: 120, priceVnd: 500_000, depositPeakVnd: 100_000 },
  ],
  staff: [
    { id: 'st-1', name: 'Linh (chủ)', role: 'Chủ tiệm', rating: 4.9, bookingCount: 950 },
    { id: 'st-2', name: 'Em Thanh', role: 'KTV', rating: 4.6, bookingCount: 380 },
  ],
};

export function getTenant(slug: string | undefined): TenantVM {
  if (slug?.includes('mai') || slug?.includes('spa')) return MAI_SPA;
  if (slug?.includes('linh') || slug?.includes('nail')) return LINH_NAIL;
  return SALON_HANG;
}

export function getMyBookings(): BookingVM[] {
  const today = new Date();
  const day = (offset: number, hour: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };
  return [
    {
      id: 'bk-1', status: 'confirmed', startAt: day(2, 15),
      serviceName: 'Nhuộm tóc', staffName: 'Hằng (chủ)',
      priceVnd: 800_000, depositPaidVnd: 200_000,
      tenantSlug: 'salon-hang', tenantName: 'Salon Hằng Hair',
    },
    {
      id: 'bk-2', status: 'pending', startAt: day(5, 10),
      serviceName: 'Treatment trắng da', staffName: 'KTV Mai',
      priceVnd: 800_000, depositPaidVnd: 0,
      tenantSlug: 'mai-spa', tenantName: 'Mai Skin Spa',
    },
    {
      id: 'bk-3', status: 'completed', startAt: day(-7, 14),
      serviceName: 'Cắt + Gội + Sấy', staffName: 'Stylist Tú',
      priceVnd: 250_000, depositPaidVnd: 0,
      tenantSlug: 'salon-hang', tenantName: 'Salon Hằng Hair',
    },
    {
      id: 'bk-4', status: 'completed', startAt: day(-14, 11),
      serviceName: 'Treatment trắng da', staffName: 'KTV Mai',
      priceVnd: 800_000, depositPaidVnd: 100_000,
      tenantSlug: 'mai-spa', tenantName: 'Mai Skin Spa',
    },
  ];
}

export function getMyPackages(): PackageProgressVM[] {
  return [
    {
      id: 'pk-1', name: 'Trắng da chuyên sâu 10 buổi',
      tenantName: 'Mai Skin Spa',
      totalSessions: 10, remaining: 4,
      expiresAt: '2026-08-01',
      serviceName: 'Treatment trắng da',
    },
  ];
}

export function generateSlots(date: string): Array<{ time: string; available: boolean; isPeak: boolean }> {
  const slots: Array<{ time: string; available: boolean; isPeak: boolean }> = [];
  const dayOfWeek = new Date(date).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  // Mock: 30-min slots from 09:00 to 22:00, some randomly unavailable
  const unavailableSet = new Set(['09:30', '11:00', '14:30', '16:00', '18:30', '20:00']);
  for (let h = 9; h < 22; h++) {
    for (const m of [0, 30]) {
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const isPeak = isWeekend && h >= 14;
      slots.push({
        time,
        available: !unavailableSet.has(time),
        isPeak,
      });
    }
  }
  return slots;
}
