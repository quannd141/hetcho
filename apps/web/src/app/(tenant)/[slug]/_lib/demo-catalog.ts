/**
 * Demo data for tenant internal pages (Services / Staff / Customers / Packages / Reports).
 * NIGHT_SHIFT_MODE only — swap with real DrizzleRepository calls after PH-001.
 */

export interface DemoService {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  priceVnd: number;
  depositNormalVnd: number;
  depositPeakVnd: number;
  isActive: boolean;
}

export interface DemoStaff {
  id: string;
  name: string;
  role: string;
  serviceIds: string[];
  workingHoursLabel: string;
  isActive: boolean;
  photoUrl?: string;
}

export interface DemoCustomer {
  id: string;
  name: string;
  phoneMasked: string;
  tier: 'normal' | 'cip' | 'vip';
  totalBookings: number;
  lifetimeSpendVnd: number;
  lastVisitAt: string;
  zaloId?: string;
  packageUsages?: Array<{ packageName: string; remaining: number; total: number; expiresAt: string }>;
}

export interface DemoPackage {
  id: string;
  name: string;
  serviceId: string;
  serviceName: string;
  totalSessions: number;
  priceVnd: number;
  validDays: number;
  soldCount: number;
}

const SALON_PROFILE = {
  services: [
    { id: 'sv-1', name: 'Cắt + Gội + Sấy', category: 'Tóc', durationMinutes: 60, priceVnd: 250_000, depositNormalVnd: 0, depositPeakVnd: 50_000, isActive: true },
    { id: 'sv-2', name: 'Nhuộm tóc', category: 'Tóc', durationMinutes: 180, priceVnd: 800_000, depositNormalVnd: 100_000, depositPeakVnd: 200_000, isActive: true },
    { id: 'sv-3', name: 'Uốn duỗi', category: 'Tóc', durationMinutes: 240, priceVnd: 1_200_000, depositNormalVnd: 200_000, depositPeakVnd: 300_000, isActive: true },
    { id: 'sv-4', name: 'Hấp dầu phục hồi', category: 'Tóc', durationMinutes: 45, priceVnd: 200_000, depositNormalVnd: 0, depositPeakVnd: 0, isActive: false },
  ] as DemoService[],
  staff: [
    { id: 'st-1', name: 'Hằng (chủ)', role: 'Chủ tiệm', serviceIds: ['sv-1', 'sv-2', 'sv-3'], workingHoursLabel: 'T2-CN 08:00-22:00', isActive: true },
    { id: 'st-2', name: 'Stylist Tú', role: 'Stylist', serviceIds: ['sv-1', 'sv-2'], workingHoursLabel: 'T2-T7 09:00-21:00', isActive: true },
    { id: 'st-3', name: 'Stylist Ngọc', role: 'Stylist', serviceIds: ['sv-1'], workingHoursLabel: 'T3-CN 10:00-22:00', isActive: true },
  ] as DemoStaff[],
};

const SPA_PROFILE = {
  services: [
    { id: 'sv-1', name: 'Treatment trắng da', category: 'Skincare', durationMinutes: 90, priceVnd: 800_000, depositNormalVnd: 100_000, depositPeakVnd: 200_000, isActive: true },
    { id: 'sv-2', name: 'Massage trị liệu', category: 'Massage', durationMinutes: 60, priceVnd: 500_000, depositNormalVnd: 100_000, depositPeakVnd: 200_000, isActive: true },
    { id: 'sv-3', name: 'Tẩy tế bào chết toàn thân', category: 'Skincare', durationMinutes: 120, priceVnd: 700_000, depositNormalVnd: 150_000, depositPeakVnd: 250_000, isActive: true },
  ] as DemoService[],
  staff: [
    { id: 'st-1', name: 'KTV Mai', role: 'KTV', serviceIds: ['sv-1', 'sv-2', 'sv-3'], workingHoursLabel: 'T2-T7 09:00-21:00', isActive: true },
    { id: 'st-2', name: 'KTV Hân', role: 'KTV', serviceIds: ['sv-1', 'sv-2'], workingHoursLabel: 'T2-T7 09:00-21:00', isActive: true },
  ] as DemoStaff[],
};

const NAIL_PROFILE = {
  services: [
    { id: 'sv-1', name: 'Nail gel cơ bản', category: 'Nail', durationMinutes: 60, priceVnd: 250_000, depositNormalVnd: 0, depositPeakVnd: 50_000, isActive: true },
    { id: 'sv-2', name: 'Nail vẽ thiết kế', category: 'Nail', durationMinutes: 120, priceVnd: 500_000, depositNormalVnd: 50_000, depositPeakVnd: 100_000, isActive: true },
  ] as DemoService[],
  staff: [
    { id: 'st-1', name: 'Linh (chủ)', role: 'Chủ tiệm', serviceIds: ['sv-1', 'sv-2'], workingHoursLabel: 'T2-CN 09:00-22:00', isActive: true },
    { id: 'st-2', name: 'Em Thanh', role: 'KTV', serviceIds: ['sv-1', 'sv-2'], workingHoursLabel: 'T2-CN 09:00-22:00', isActive: true },
    { id: 'st-3', name: 'Em Vy', role: 'KTV', serviceIds: ['sv-1'], workingHoursLabel: 'T3-CN 10:00-21:00', isActive: true },
  ] as DemoStaff[],
};

function pickProfile(slug: string) {
  if (slug.includes('spa') || slug.includes('mai')) return SPA_PROFILE;
  if (slug.includes('nail') || slug.includes('linh')) return NAIL_PROFILE;
  return SALON_PROFILE;
}

export function demoServices(slug: string): DemoService[] {
  return pickProfile(slug).services;
}

export function demoStaff(slug: string): DemoStaff[] {
  return pickProfile(slug).staff;
}

export function demoCustomers(slug: string): DemoCustomer[] {
  const profile = pickProfile(slug);
  const isSpa = profile === SPA_PROFILE;
  return [
    {
      id: 'cu-1', name: 'Chị Hằng Nguyễn', phoneMasked: '09***1234', tier: 'vip', totalBookings: 52, lifetimeSpendVnd: 32_500_000, lastVisitAt: '2026-05-12', zaloId: 'zalo-hang',
      packageUsages: isSpa ? [{ packageName: 'Trắng da 10 buổi', remaining: 4, total: 10, expiresAt: '2026-08-01' }] : undefined,
    },
    {
      id: 'cu-2', name: 'Chị Mai Trần', phoneMasked: '09***5678', tier: 'cip', totalBookings: 22, lifetimeSpendVnd: 7_800_000, lastVisitAt: '2026-05-09', zaloId: 'zalo-mai',
    },
    {
      id: 'cu-3', name: 'Chị Lan Lê', phoneMasked: '09***9012', tier: 'cip', totalBookings: 15, lifetimeSpendVnd: 4_500_000, lastVisitAt: '2026-04-28', zaloId: 'zalo-lan',
    },
    {
      id: 'cu-4', name: 'Chị Phương', phoneMasked: '09***3456', tier: 'normal', totalBookings: 3, lifetimeSpendVnd: 750_000, lastVisitAt: '2026-04-15',
    },
    {
      id: 'cu-5', name: 'Khách walk-in Quỳnh', phoneMasked: '09***7890', tier: 'normal', totalBookings: 1, lifetimeSpendVnd: 250_000, lastVisitAt: '2026-05-14',
    },
  ];
}

export function demoPackages(slug: string): DemoPackage[] {
  const profile = pickProfile(slug);
  const isSpa = profile === SPA_PROFILE;
  if (!isSpa) return [];
  return [
    { id: 'pk-1', name: 'Trắng da chuyên sâu 10 buổi', serviceId: 'sv-1', serviceName: 'Treatment trắng da', totalSessions: 10, priceVnd: 6_500_000, validDays: 90, soldCount: 24 },
    { id: 'pk-2', name: 'Massage thư giãn 5 buổi', serviceId: 'sv-2', serviceName: 'Massage trị liệu', totalSessions: 5, priceVnd: 2_000_000, validDays: 60, soldCount: 12 },
  ];
}

export function demoReports(slug: string) {
  void slug;
  return {
    today: { revenue: 3_750_000, bookings: 8, completed: 5, noShow: 1 },
    week: { revenue: 23_400_000, bookings: 47, completed: 41, noShow: 3, retention: 0.78 },
    month: { revenue: 95_800_000, bookings: 192, newCustomers: 28, returningCustomers: 142 },
    topServices: [
      { name: 'Cắt + Gội + Sấy', count: 38, revenue: 9_500_000 },
      { name: 'Nhuộm tóc', count: 14, revenue: 11_200_000 },
      { name: 'Uốn duỗi', count: 6, revenue: 7_200_000 },
    ],
    topStaff: [
      { name: 'Hằng (chủ)', bookings: 32, revenue: 12_500_000, rating: 4.9 },
      { name: 'Stylist Tú', bookings: 24, revenue: 8_300_000, rating: 4.7 },
      { name: 'Stylist Ngọc', bookings: 18, revenue: 6_400_000, rating: 4.6 },
    ],
    revenueChart: [
      { day: 'T2', value: 2_400_000 },
      { day: 'T3', value: 3_100_000 },
      { day: 'T4', value: 2_800_000 },
      { day: 'T5', value: 3_900_000 },
      { day: 'T6', value: 4_200_000 },
      { day: 'T7', value: 6_500_000 },
      { day: 'CN', value: 5_800_000 },
    ],
  };
}
