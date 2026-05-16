import Link from 'next/link';
import { AdminShell } from './_components/admin-shell';

const STATS = [
  { label: 'Tổng tiệm', value: '127', delta: '+8 tuần này', positive: true },
  { label: 'Tiệm Pro', value: '23', delta: '18% conversion', positive: true },
  { label: 'MRR', value: '12.45M ₫', delta: '+2.1M MoM', positive: true },
  { label: 'Booking 24h', value: '1,847', delta: '+12% DoD', positive: true },
];

const RECENT_TENANTS = [
  { slug: 'salon-hang', name: 'Salon Hằng', city: 'TP.HCM', plan: 'Free', created: '2026-05-15', status: 'active' as const },
  { slug: 'mai-spa', name: 'Mai Spa', city: 'Hà Nội', plan: 'Pro', created: '2026-05-14', status: 'active' as const },
  { slug: 'linh-nail', name: 'Linh Nail', city: 'Đà Nẵng', plan: 'Free', created: '2026-05-13', status: 'active' as const },
  { slug: 'tonny-barber', name: 'Tonny Barber', city: 'TP.HCM', plan: 'Free', created: '2026-05-12', status: 'onboarding' as const },
  { slug: 'beauty-house', name: 'Beauty House', city: 'TP.HCM', plan: 'Pro', created: '2026-05-11', status: 'suspended' as const },
];

const SYSTEM_ALERTS = [
  { level: 'error' as const, message: 'VNPay webhook 5xx error rate > 1% trong 1h qua', time: '12 phút trước' },
  { level: 'warning' as const, message: 'Supabase storage usage 78% (gần limit Free plan)', time: '2 giờ trước' },
  { level: 'info' as const, message: 'Sentry: lỗi mới ở `/dashboard` (3 occurrences)', time: '5 giờ trước' },
];

export default function AdminOverviewPage() {
  return (
    <AdminShell active="overview">
      <h1 className="text-2xl font-bold mb-1">Tổng quan platform</h1>
      <p className="text-sm text-slate-500 mb-6">Snapshot toàn HếtChờ — cập nhật 5 phút/lần.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className="text-2xl font-bold mt-1">{s.value}</div>
            <div className={`text-xs mt-1 ${s.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {s.delta}
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <section className="md:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold">Tiệm mới đăng ký</h2>
            <Link href="/admin/tenants" className="text-sm text-brand-600 hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs">
              <tr>
                <th className="text-left px-6 py-2 font-medium">Tiệm</th>
                <th className="text-left px-3 py-2 font-medium">Tỉnh</th>
                <th className="text-left px-3 py-2 font-medium">Gói</th>
                <th className="text-left px-3 py-2 font-medium">Trạng thái</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {RECENT_TENANTS.map((t) => (
                <tr key={t.slug} className="hover:bg-slate-50">
                  <td className="px-6 py-3">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-slate-500">/{t.slug}</div>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{t.city}</td>
                  <td className="px-3 py-3">
                    {t.plan === 'Pro' ? (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Pro</span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Free</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {t.status === 'active' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Active</span>}
                    {t.status === 'onboarding' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Onboarding</span>}
                    {t.status === 'suspended' && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded">Suspended</span>}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Link href={`/admin/tenants/${t.slug}`} className="text-xs text-brand-600 hover:underline">
                      Mở
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold">Cảnh báo hệ thống</h2>
          </div>
          <ul className="divide-y divide-slate-100">
            {SYSTEM_ALERTS.map((a, i) => (
              <li key={i} className="px-6 py-3">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">
                    {a.level === 'error' && '🔴'}
                    {a.level === 'warning' && '🟡'}
                    {a.level === 'info' && '🔵'}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm">{a.message}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{a.time}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="px-6 py-3 border-t border-slate-100">
            <Link href="/admin/health" className="text-sm text-brand-600 hover:underline">
              Mở dashboard hệ thống →
            </Link>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
