import { TenantShell } from '../_components/tenant-shell';
import { demoReports } from '../_lib/demo-catalog';

interface PageProps { params: { slug: string }; searchParams: { range?: string } }

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export default function ReportsPage({ params, searchParams }: PageProps) {
  const range = searchParams.range ?? 'week';
  const data = demoReports(params.slug);
  const maxRevenue = Math.max(...data.revenueChart.map((d) => d.value));

  return (
    <TenantShell slug={params.slug} active="reports">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Báo cáo</h1>
          <p className="text-sm text-slate-500 mt-1">Doanh thu, dịch vụ bán chạy, thợ giỏi nhất.</p>
        </div>
        <div className="inline-flex rounded-md border border-slate-200 bg-white">
          {['day', 'week', 'month'].map((r) => (
            <a
              key={r}
              href={`?range=${r}`}
              className={`px-4 py-2 text-sm font-medium ${
                range === r ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {r === 'day' ? 'Hôm nay' : r === 'week' ? '7 ngày' : '30 ngày'}
            </a>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card label="Doanh thu" value={fmtVnd(range === 'day' ? data.today.revenue : range === 'week' ? data.week.revenue : data.month.revenue)} delta="+12%" />
        <Card label="Booking" value={String(range === 'day' ? data.today.bookings : range === 'week' ? data.week.bookings : data.month.bookings)} delta="+8%" />
        {range === 'week' && <Card label="Retention" value={`${Math.round(data.week.retention * 100)}%`} delta="+3%" />}
        {range === 'day' && <Card label="Hoàn tất" value={String(data.today.completed)} />}
        {range === 'day' && <Card label="No-show" value={String(data.today.noShow)} delta="-50%" deltaColor="text-emerald-600" />}
        {range === 'week' && <Card label="No-show" value={String(data.week.noShow)} delta="-30%" deltaColor="text-emerald-600" />}
        {range === 'month' && <Card label="Khách mới" value={String(data.month.newCustomers)} delta="+22%" />}
        {range === 'month' && <Card label="Khách quay lại" value={String(data.month.returningCustomers)} />}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Doanh thu 7 ngày qua</h2>
          <div className="flex items-end gap-2 h-48">
            {data.revenueChart.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-brand-500 rounded-t-md min-h-[8px]"
                  style={{ height: `${(d.value / maxRevenue) * 100}%` }}
                  title={fmtVnd(d.value)}
                />
                <div className="text-xs text-slate-500">{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Top dịch vụ</h2>
          <div className="space-y-3">
            {data.topServices.map((s, i) => (
              <div key={s.name}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">#{i + 1} {s.name}</span>
                  <span className="text-slate-600">{s.count}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{fmtVnd(s.revenue)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold mb-4">Top thợ / KTV</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-slate-500 text-xs uppercase">
            <tr>
              <th className="py-2">Tên</th>
              <th className="py-2 text-right">Booking</th>
              <th className="py-2 text-right">Doanh thu</th>
              <th className="py-2 text-right">Rating TB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.topStaff.map((s, i) => (
              <tr key={s.name}>
                <td className="py-3 font-medium">#{i + 1} {s.name}</td>
                <td className="py-3 text-right">{s.bookings}</td>
                <td className="py-3 text-right font-mono">{fmtVnd(s.revenue)}</td>
                <td className="py-3 text-right">⭐ {s.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Dữ liệu demo — sẽ wire DB query khi PH-001 (Supabase) xong.
      </p>
    </TenantShell>
  );
}

function Card({ label, value, delta, deltaColor }: { label: string; value: string; delta?: string; deltaColor?: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {delta && <div className={`text-xs mt-1 ${deltaColor ?? 'text-emerald-600'}`}>{delta} vs kỳ trước</div>}
    </div>
  );
}
