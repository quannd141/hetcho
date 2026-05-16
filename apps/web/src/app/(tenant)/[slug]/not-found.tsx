import Link from 'next/link';

export default function TenantNotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-4">🏪</div>
        <h1 className="text-3xl font-bold mb-2">Tiệm chưa kích hoạt</h1>
        <p className="text-slate-600 mb-6">
          Subdomain này chưa được tiệm nào sử dụng. Có thể anh nhập sai địa chỉ
          hoặc tiệm còn ở giai đoạn onboarding.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="rounded-md bg-brand-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-brand-700"
          >
            Về trang chủ
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium hover:bg-slate-50"
          >
            Đăng ký tiệm mới
          </Link>
        </div>
      </div>
    </main>
  );
}
