/**
 * Demo data builder cho dashboard preview trong NIGHT_SHIFT_MODE.
 *
 * Khi PH-001 (Supabase) xong, swap với call ListBookingsForDateUseCase
 * dùng DrizzleBookingRepository.
 */

export interface DemoBookingRow {
  bookingId: string;
  status: string;
  startAt: string;
  endAt: string;
  customerName: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  isPeakSlot: boolean;
  depositPaidVnd: number;
  depositRequiredVnd: number;
}

const SALON_STAFF = [
  { id: 'staff-tu', name: 'Stylist Tú' },
  { id: 'staff-ngoc', name: 'Stylist Ngọc' },
];

const SPA_STAFF = [
  { id: 'staff-mai', name: 'KTV Mai' },
  { id: 'staff-han', name: 'KTV Hân' },
];

const NAIL_STAFF = [
  { id: 'staff-linh', name: 'KTV Linh' },
];

function todayAt(hh: number, mm = 0): string {
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}

function plusMin(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

export function demoStaffList(slug: string) {
  if (slug.includes('spa') || slug.includes('mai')) return SPA_STAFF;
  if (slug.includes('nail') || slug.includes('linh')) return NAIL_STAFF;
  return SALON_STAFF;
}

export function demoBookings(slug: string): DemoBookingRow[] {
  const staff = demoStaffList(slug);
  const isSpa = slug.includes('spa') || slug.includes('mai');
  const duration = isSpa ? 90 : 45;
  const service = isSpa ? 'Chăm da mặt cơ bản' : 'Cắt + Gội + Sấy';

  return [
    {
      bookingId: 'demo-1',
      status: 'completed',
      startAt: todayAt(9),
      endAt: plusMin(todayAt(9), duration),
      customerName: 'Chị Hằng',
      serviceName: service,
      staffId: staff[0]!.id,
      staffName: staff[0]!.name,
      isPeakSlot: false,
      depositPaidVnd: 0,
      depositRequiredVnd: 0,
    },
    {
      bookingId: 'demo-2',
      status: 'in_service',
      startAt: todayAt(10, 30),
      endAt: plusMin(todayAt(10, 30), duration),
      customerName: 'Chị Lan',
      serviceName: service,
      staffId: staff[0]!.id,
      staffName: staff[0]!.name,
      isPeakSlot: false,
      depositPaidVnd: 0,
      depositRequiredVnd: 0,
    },
    {
      bookingId: 'demo-3',
      status: 'confirmed',
      startAt: todayAt(14),
      endAt: plusMin(todayAt(14), duration),
      customerName: 'Chị Mai',
      serviceName: service,
      staffId: staff[staff.length - 1]!.id,
      staffName: staff[staff.length - 1]!.name,
      isPeakSlot: false,
      depositPaidVnd: 0,
      depositRequiredVnd: 0,
    },
    {
      bookingId: 'demo-4',
      status: 'pending',
      startAt: todayAt(15, 30),
      endAt: plusMin(todayAt(15, 30), duration),
      customerName: 'Chị Phương',
      serviceName: service,
      staffId: staff[0]!.id,
      staffName: staff[0]!.name,
      isPeakSlot: true,
      depositPaidVnd: 0,
      depositRequiredVnd: 100_000,
    },
    {
      bookingId: 'demo-5',
      status: 'confirmed',
      startAt: todayAt(17),
      endAt: plusMin(todayAt(17), duration),
      customerName: 'Chị Quỳnh',
      serviceName: service,
      staffId: staff[staff.length - 1]!.id,
      staffName: staff[staff.length - 1]!.name,
      isPeakSlot: true,
      depositPaidVnd: 200_000,
      depositRequiredVnd: 200_000,
    },
  ];
}

export function demoStats(rows: DemoBookingRow[]) {
  const todayCount = rows.length;
  const checkedIn = rows.filter((r) => ['checked_in', 'in_service', 'completed'].includes(r.status)).length;
  const revenue = rows
    .filter((r) => r.status === 'completed')
    .reduce((acc, r) => acc + (r.depositPaidVnd || 250_000), 0);
  const noShow = rows.filter((r) => r.status === 'no_show').length;
  return { todayCount, checkedIn, revenue, noShow };
}
