import Link from 'next/link';
import { AccountShell } from '../_components/account-shell';

const TENANTS = [
  { slug: 'salon-hang', name: 'Salon Hằng', type: 'Salon tóc', role: 'Owner', plan: 'Free', staffCount: 3 },
  { slug: 'mai-spa', name: 'Mai Spa', type: 'Spa skincare', role: 'Owner', plan: 'Pro', staffCount: 5 },
  { slug: 'linh-nail', name: 'Linh Nail', type: 'Nail', role: 'Manager', plan: 'Free', staffCount: 2 },
];

export default function AccountTenantsPage() {
  return (
    <AccountShell active="tenants">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Tiệm của tôi</h1>
            <p className="text-sm text-slate-500 mt-1">Các tiệm anh đang sở hữu hoặc được mời quản lý.</p>
          </div>
          <Link
            href="/signup"
            className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700"
          >
            + Tiệm mới
          </Link>
        </div>

        <ul className="divide-y divide-slate-100">
          {TENANTS.map((t) => (
            <li key={t.slug} className="px-6 py-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-lg font-bold">
                {t.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-xs text-slate-400">/{t.slug}</span>
                  {t.plan === 'Pro' && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Pro</span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {t.type} · {t.staffCount} thợ · vai trò: <strong>{t.role}</strong>
                </div>
              </div>
              <Link
                href={`/${t.slug}/dashboard`}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                Mở dashboard
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AccountShell>
  );
}
