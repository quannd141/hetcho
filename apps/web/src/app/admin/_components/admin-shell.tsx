import Link from 'next/link';
import type { ReactNode } from 'react';

interface AdminShellProps {
  active?: 'overview' | 'tenants' | 'billing' | 'health' | 'audit';
  children: ReactNode;
}

const NAV = [
  { key: 'overview', label: 'Tổng quan', href: '/admin' },
  { key: 'tenants', label: 'Tiệm', href: '/admin/tenants' },
  { key: 'billing', label: 'Doanh thu', href: '/admin/billing' },
  { key: 'health', label: 'Hệ thống', href: '/admin/health' },
  { key: 'audit', label: 'Audit log', href: '/admin/audit' },
] as const;

export function AdminShell({ active, children }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-rose-200 bg-rose-50 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-brand-600">HếtChờ</Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs px-2 py-1 bg-rose-100 text-rose-700 rounded font-semibold uppercase">
              Super Admin
            </span>
          </div>
          <nav className="flex gap-1 text-sm font-medium">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`px-3 py-2 rounded-md ${
                  active === item.key
                    ? 'bg-white text-rose-700 border border-rose-200'
                    : 'text-slate-600 hover:bg-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="text-xs text-slate-500">
            <strong>Quân Nguyễn</strong> (Founder)
          </div>
        </div>
      </header>
      <div className="container mx-auto px-6 py-8">{children}</div>
    </main>
  );
}
