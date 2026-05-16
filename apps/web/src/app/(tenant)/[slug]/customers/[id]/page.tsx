import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TenantShell } from '../../_components/tenant-shell';
import { demoCustomers } from '../../_lib/demo-catalog';

interface PageProps { params: { slug: string; id: string } }

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

const DEMO_HISTORY = [
  { date: '2026-05-12', service: 'Cắt + Gội + Sấy', staff: 'Stylist Tú', priceVnd: 250_000, status: 'completed' },
  { date: '2026-04-28', service: 'Nhuộm tóc', staff: 'Hằng (chủ)', priceVnd: 800_000, status: 'completed' },
  { date: '2026-04-10', service: 'Cắt + Gội + Sấy', staff: 'Stylist Tú', priceVnd: 250_000, status: 'completed' },
  { date: '2026-03-25', service: 'Uốn duỗi', staff: 'Hằng (chủ)', priceVnd: 1_200_000, status: 'completed' },
  { date: '2026-03-08', service: 'Cắt + Gội + Sấy', staff: 'Stylist Tú', priceVnd: 250_000, status: 'no_show' },
];

export default function CustomerDetailPage({ params }: PageProps) {
  const customer = demoCustomers(params.slug).find((c) => c.id === params.id);
  if (!customer) notFound();

  return (
    <TenantShell slug={params.slug} active="customers">
      <Link href={`/${params.slug}/customers`} className="text-sm text-slate-500 hover:underline">← Quay về Khách hàng</Link>

      <div className="grid lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
            <div className="w-20 h-20 mx-auto bg-brand-50 rounded-full flex items-center justify-center text-3xl font-bold text-brand-600">
              {customer.name.charAt(0)}
            </div>
            <h2 className="mt-3 text-lg font-bold">{customer.name}</h2>
            <p className="text-sm font-mono text-slate-600">{customer.phoneMasked}</p>
            {customer.zaloId ? (
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                📱 Liên kết Zalo: {customer.zaloId}
              </div>
            ) : (
              <div className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                Walk-in (chưa có Zalo)
              </div>
            )}
            <div className="mt-4">
              <span className={`text-sm px-3 py-1 rounded-full ${
                customer.tier === 'vip' ? 'bg-amber-100 text-amber-800' :
                customer.tier === 'cip' ? 'bg-blue-100 text-blue-800' :
                'bg-slate-100 text-slate-600'
              }`}>
                {customer.tier === 'vip' ? '⭐ VIP' : customer.tier === 'cip' ? '💎 CIP' : 'Normal'}
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold mb-3">Thống kê</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Số lượt</span><span className="font-semibold">{customer.totalBookings}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tổng chi tiêu</span><span className="font-semibold font-mono">{fmtVnd(customer.lifetimeSpendVnd)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Trung bình / lượt</span><span className="font-mono">{fmtVnd(Math.round(customer.lifetimeSpendVnd / Math.max(1, customer.totalBookings)))}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Lần cuối</span><span>{customer.lastVisitAt}</span></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-semibold mb-3">Ghi chú (CRM lite — Sprint 7)</h3>
            <textarea
              rows={4}
              placeholder="VD: dị ứng amoniac, thích uốn tự nhiên, sinh nhật 12/8..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button className="mt-2 rounded-md bg-brand-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-brand-700">Lưu</button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {customer.packageUsages && customer.packageUsages.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Liệu trình đang sử dụng</h3>
              <div className="space-y-4">
                {customer.packageUsages.map((p) => {
                  const used = p.total - p.remaining;
                  const percent = Math.round((used / p.total) * 100);
                  return (
                    <div key={p.packageName}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{p.packageName}</span>
                        <span className="text-sm text-slate-600">{used} / {p.total} buổi</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${percent}%` }} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Hết hạn: {p.expiresAt} · Còn {p.remaining} buổi</p>
                    </div>
                  );
                })}
              </div>
              <button className="mt-4 rounded-md border border-brand-600 text-brand-600 px-3 py-1.5 text-sm font-medium hover:bg-brand-50">
                + Bán gói mới
              </button>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold">Lịch sử ({DEMO_HISTORY.length} lượt)</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Ngày</th>
                  <th className="px-4 py-3 font-semibold">Dịch vụ</th>
                  <th className="px-4 py-3 font-semibold">Thợ</th>
                  <th className="px-4 py-3 font-semibold text-right">Giá</th>
                  <th className="px-4 py-3 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DEMO_HISTORY.map((h, i) => (
                  <tr key={i} className={h.status === 'no_show' ? 'bg-rose-50/50' : ''}>
                    <td className="px-4 py-3 text-slate-600">{h.date}</td>
                    <td className="px-4 py-3 font-medium">{h.service}</td>
                    <td className="px-4 py-3 text-slate-600">{h.staff}</td>
                    <td className="px-4 py-3 text-right font-mono">{fmtVnd(h.priceVnd)}</td>
                    <td className="px-4 py-3">
                      {h.status === 'completed' ? (
                        <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded">Hoàn tất</span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-rose-50 text-rose-700 rounded">Bỏ hẹn</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TenantShell>
  );
}
