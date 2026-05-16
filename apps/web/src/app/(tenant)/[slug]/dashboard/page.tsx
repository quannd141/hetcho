import Link from 'next/link';
import { DayGrid } from './_components/day-grid';
import { DayWeekToggle } from './_components/day-week-toggle';
import { demoBookings, demoStaffList, demoStats } from './_lib/demo-data';

interface PageProps {
  params: { slug: string };
  searchParams: { view?: string };
}

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export default function DashboardPage({ params, searchParams }: PageProps) {
  const view: 'day' | 'week' = searchParams.view === 'week' ? 'week' : 'day';
  const rows = demoBookings(params.slug);
  const staffList = demoStaffList(params.slug);
  const stats = demoStats(rows);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-brand-600">HếtChờ</Link>
            <span className="text-slate-300">|</span>
            <span className="font-medium">{params.slug}</span>
          </div>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href={`/${params.slug}/dashboard`} className="text-brand-600">Lịch hôm nay</Link>
            <Link href={`/${params.slug}/services`}>Dịch vụ</Link>
            <Link href={`/${params.slug}/staff`}>Thợ / KTV</Link>
            <Link href={`/${params.slug}/customers`}>Khách hàng</Link>
            <Link href={`/${params.slug}/settings`}>Cấu hình</Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-4 mb-6">
          <StatCard label="Booking hôm nay" value={String(stats.todayCount)} />
          <StatCard label="Khách check-in" value={String(stats.checkedIn)} />
          <StatCard label="Doanh thu hôm nay" value={fmtVnd(stats.revenue)} />
          <StatCard label="No-show" value={String(stats.noShow)} />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Lịch hẹn</h1>
          <div className="flex items-center gap-3">
            <DayWeekToggle slug={params.slug} view={view} />
            <Link
              href={`/${params.slug}/dashboard/walk-in`}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              + Khách walk-in
            </Link>
          </div>
        </div>

        {view === 'day' ? (
          <DayGrid bookings={rows} staffList={staffList} date={new Date()} />
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
            Week view sẽ implement Sprint 2 (TODO sau khi day view validate UX với 3 tiệm pilot).
            <p className="mt-2 text-xs text-slate-400">Bấm "Ngày" để xem chế độ hiện tại.</p>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">
          Dữ liệu demo — Realtime auto-refresh sẽ wire khi PH-001 (Supabase) xong (Sprint 4 đầu).
        </p>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
