import Link from 'next/link';
import { AdminShell } from '../_components/admin-shell';

const TENANTS = [
  { slug: 'salon-hang', name: 'Salon Hằng', type: 'Salon tóc', city: 'TP.HCM', plan: 'Free', mrr: 0, staffCount: 3, bookings30d: 124, status: 'active', owner: 'Hằng Nguyễn' },
  { slug: 'mai-spa', name: 'Mai Spa', type: 'Spa', city: 'Hà Nội', plan: 'Pro', mrr: 299_000, staffCount: 5, bookings30d: 287, status: 'active', owner: 'Mai Trần' },
  { slug: 'linh-nail', name: 'Linh Nail', type: 'Nail', city: 'Đà Nẵng', plan: 'Free', mrr: 0, staffCount: 2, bookings30d: 76, status: 'active', owner: 'Linh Phạm' },
  { slug: 'tonny-barber', name: 'Tonny Barber', type: 'Barber', city: 'TP.HCM', plan: 'Free', mrr: 0, staffCount: 1, bookings30d: 12, status: 'onboarding', owner: 'Tonny Lê' },
  { slug: 'beauty-house', name: 'Beauty House', type: 'Spa', city: 'TP.HCM', plan: 'Pro', mrr: 299_000, staffCount: 8, bookings30d: 0, status: 'suspended', owner: 'Vy Đỗ' },
  { slug: 'goi-dau-thu-gian', name: 'Gội đầu Thư giãn', type: 'Gội đầu', city: 'Hà Nội', plan: 'Free', mrr: 0, staffCount: 2, bookings30d: 198, status: 'active', owner: 'Thanh Phạm' },
];

const fmtVnd = (n: number) => n === 0 ? '—' : n.toLocaleString('vi-VN') + ' ₫';

export default function AdminTenantsPage() {
  return (
    <AdminShell active="tenants">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tiệm ({TENANTS.length})</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý mọi tiệm trên platform — suspend / impersonate / billing override.</p>
        </div>
        <button className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
          Export CSV
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input type="search" placeholder="Tìm tiệm theo tên / slug / owner..." className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <select className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option>Mọi loại tiệm</option>
          <option>Salon tóc</option>
          <option>Spa</option>
          <option>Nail</option>
          <option>Barber</option>
          <option>Gội đầu</option>
          <option>Massage</option>
        </select>
        <select className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option>Mọi gói</option>
          <option>Free</option>
          <option>Pro</option>
        </select>
        <select className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option>Mọi trạng thái</option>
          <option>Active</option>
          <option>Onboarding</option>
          <option>Suspended</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="text-left px-6 py-3 font-medium">Tiệm</th>
              <th className="text-left px-3 py-3 font-medium">Loại</th>
              <th className="text-left px-3 py-3 font-medium">Tỉnh</th>
              <th className="text-left px-3 py-3 font-medium">Owner</th>
              <th className="text-left px-3 py-3 font-medium">Gói</th>
              <th className="text-right px-3 py-3 font-medium">MRR</th>
              <th className="text-right px-3 py-3 font-medium">Thợ</th>
              <th className="text-right px-3 py-3 font-medium">Booking 30d</th>
              <th className="text-left px-3 py-3 font-medium">Trạng thái</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {TENANTS.map((t) => (
              <tr key={t.slug} className="hover:bg-slate-50">
                <td className="px-6 py-3">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-slate-500 font-mono">/{t.slug}</div>
                </td>
                <td className="px-3 py-3 text-slate-600">{t.type}</td>
                <td className="px-3 py-3 text-slate-600">{t.city}</td>
                <td className="px-3 py-3 text-xs text-slate-600">{t.owner}</td>
                <td className="px-3 py-3">
                  {t.plan === 'Pro' ? (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Pro</span>
                  ) : (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Free</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right font-mono text-xs">{fmtVnd(t.mrr)}</td>
                <td className="px-3 py-3 text-right">{t.staffCount}</td>
                <td className="px-3 py-3 text-right">{t.bookings30d}</td>
                <td className="px-3 py-3">
                  {t.status === 'active' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Active</span>}
                  {t.status === 'onboarding' && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Onboarding</span>}
                  {t.status === 'suspended' && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded">Suspended</span>}
                </td>
                <td className="px-3 py-3 text-right">
                  <Link href={`/admin/tenants/${t.slug}`} className="text-xs text-brand-600 hover:underline">Mở</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
