'use client';

import Link from 'next/link';

const TENANT_TYPES = [
  { value: 'salon_toc', label: 'Salon tóc' },
  { value: 'spa_skincare', label: 'Spa / Skincare' },
  { value: 'nail', label: 'Nail' },
  { value: 'goi_dau', label: 'Gội đầu dưỡng sinh' },
  { value: 'barber', label: 'Barber' },
  { value: 'massage', label: 'Massage' },
  { value: 'other', label: 'Khác' },
] as const;

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Đăng ký tiệm mới</h1>
        <p className="mt-2 text-sm text-slate-500">
          Miễn phí 12 tháng đầu. Không cần thẻ tín dụng. Hủy bất cứ lúc nào.
        </p>

        <form
          className="mt-6 space-y-4"
          action="/onboarding"
          method="get"
        >
          <label className="block">
            <span className="text-sm font-medium">Tên tiệm</span>
            <input
              required
              name="name"
              placeholder="VD: Salon Hằng Hair"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Loại tiệm</span>
            <select
              required
              name="type"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            >
              {TENANT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Slug (URL tiệm)</span>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-slate-500 text-sm">hetcho.vn/</span>
              <input
                required
                name="slug"
                pattern="[a-z0-9-]+"
                placeholder="salon-cua-toi"
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">Chỉ dùng chữ thường, số, gạch ngang.</p>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Email chủ tiệm</span>
            <input
              required
              type="email"
              name="ownerEmail"
              placeholder="ban@example.com"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-md bg-brand-600 px-4 py-3 text-white font-medium hover:bg-brand-700"
          >
            Tạo tiệm & tiếp tục onboarding
          </button>

          <p className="text-xs text-slate-500 text-center">
            Có tài khoản rồi? <Link href="/login" className="text-brand-600 hover:underline">Đăng nhập</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
