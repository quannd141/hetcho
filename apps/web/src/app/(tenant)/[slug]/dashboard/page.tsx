import Link from 'next/link';
import { TenantShell } from '../_components/tenant-shell';
import { DayGrid } from './_components/day-grid';
import { DayWeekToggle } from './_components/day-week-toggle';
import { listBookingsByDate, listStaff } from '@/lib/queries';

interface PageProps {
  params: { slug: string };
  searchParams: { view?: string; date?: string; walkInCreated?: string; welcome?: string };
}

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export default async function DashboardPage({ params, searchParams }: PageProps) {
  const view: 'day' | 'week' = searchParams.view === 'week' ? 'week' : 'day';
  const date = searchParams.date ? new Date(searchParams.date) : new Date();

  const [rows, staffList] = await Promise.all([
    listBookingsByDate(params.slug, date),
    listStaff(params.slug),
  ]);

  const stats = computeStats(rows);

  return (
    <TenantShell slug={params.slug} active="dashboard">
      {searchParams.welcome === '1' && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-md text-sm text-emerald-800">
          🎉 Chào mừng đến HếtChờ! Tiệm của anh đã được tạo. Bước tiếp theo: thêm dịch vụ + thợ.
        </div>
      )}
      {searchParams.walkInCreated === '1' && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-sm text-emerald-800">
          ✅ Đã tạo booking walk-in.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatCard label="Booking hôm nay" value={String(stats.todayCount)} />
        <StatCard label="Khách check-in" value={String(stats.checkedIn)} />
        <StatCard label="Doanh thu hôm nay" value={fmtVnd(stats.revenue)} />
        <StatCard label="No-show" value={String(stats.noShow)} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Lịch hẹn ({rows.length})</h1>
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
        rows.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
            <div className="text-5xl mb-3">📅</div>
            <p className="text-slate-600 font-medium">Chưa có booking nào hôm nay</p>
            <p className="mt-2 text-sm text-slate-500">Tạo walk-in tại quầy hoặc chia sẻ link đặt lịch cho khách.</p>
            <Link
              href={`/${params.slug}/dashboard/walk-in`}
              className="mt-4 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              + Thêm walk-in
            </Link>
          </div>
        ) : (
          <DayGrid
            bookings={rows.map((r) => ({
              bookingId: r.bookingId,
              status: r.status,
              startAt: r.startAt,
              endAt: r.endAt,
              customerName: r.customerName,
              serviceName: r.serviceName,
              staffId: r.staffId,
              staffName: r.staffName,
              isPeakSlot: r.isPeakSlot,
              depositPaidVnd: r.depositPaidVnd,
              depositRequiredVnd: r.depositRequiredVnd,
            }))}
            staffList={staffList.map((s) => ({ id: s.id, name: s.name }))}
            date={date}
            slug={params.slug}
          />
        )
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
          Week view sẽ implement Sprint 2 (TODO sau khi day view validate UX với 3 tiệm pilot).
        </div>
      )}

      <p className="mt-8 text-center text-xs text-slate-400">
        💾 Mock mode — dữ liệu tồn tại in-memory cho đến khi restart server. Realtime auto-refresh khi PH-001 (Supabase) xong.
      </p>
    </TenantShell>
  );
}

function computeStats(rows: Array<{ status: string; finalPriceVnd: number | null }>) {
  return {
    todayCount: rows.length,
    checkedIn: rows.filter((r) => r.status === 'checked_in' || r.status === 'in_service').length,
    revenue: rows.filter((r) => r.status === 'completed').reduce((sum, r) => sum + (r.finalPriceVnd ?? 0), 0),
    noShow: rows.filter((r) => r.status === 'no_show').length,
  };
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
