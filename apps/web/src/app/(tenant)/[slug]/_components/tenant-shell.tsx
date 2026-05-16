import Link from 'next/link';
import type { ReactNode } from 'react';

interface TenantShellProps {
  slug: string;
  active?: 'dashboard' | 'services' | 'staff' | 'customers' | 'packages' | 'reports' | 'marketing' | 'settings';
  children: ReactNode;
}

const NAV = [
  { key: 'dashboard', label: 'Lịch hôm nay', href: 'dashboard' },
  { key: 'services', label: 'Dịch vụ', href: 'services' },
  { key: 'staff', label: 'Thợ / KTV', href: 'staff' },
  { key: 'customers', label: 'Khách hàng', href: 'customers' },
  { key: 'packages', label: 'Gói liệu trình', href: 'packages' },
  { key: 'reports', label: 'Báo cáo', href: 'reports' },
  { key: 'marketing', label: 'Marketing', href: 'marketing' },
  { key: 'settings', label: 'Cấu hình', href: 'settings' },
] as const;

export function TenantShell({ slug, active, children }: TenantShellProps) {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-brand-600">HếtChờ</Link>
            <span className="text-slate-300">|</span>
            <span className="font-medium">{slug}</span>
          </div>
          <nav className="flex gap-1 text-sm font-medium overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={`/${slug}/${item.href}`}
                className={`px-3 py-2 rounded-md ${
                  active === item.key
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="container mx-auto px-6 py-8">{children}</div>
    </main>
  );
}
