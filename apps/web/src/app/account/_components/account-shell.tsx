import Link from 'next/link';
import type { ReactNode } from 'react';

interface AccountShellProps {
  active?: 'profile' | 'password' | 'security' | 'tenants';
  children: ReactNode;
}

const NAV = [
  { key: 'profile', label: 'Hồ sơ', href: '/account' },
  { key: 'password', label: 'Đổi mật khẩu', href: '/account/password' },
  { key: 'security', label: 'Bảo mật', href: '/account/security' },
  { key: 'tenants', label: 'Tiệm của tôi', href: '/account/tenants' },
] as const;

export function AccountShell({ active, children }: AccountShellProps) {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-brand-600">HếtChờ</Link>
            <span className="text-slate-300">|</span>
            <span className="font-medium">Tài khoản chủ tiệm</span>
          </div>
          <form action="/login" method="get">
            <button className="text-sm text-rose-600 hover:underline">Đăng xuất</button>
          </form>
        </div>
      </header>
      <div className="container mx-auto px-6 py-8 grid md:grid-cols-[220px_1fr] gap-8">
        <nav className="space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                active === item.key
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </main>
  );
}
