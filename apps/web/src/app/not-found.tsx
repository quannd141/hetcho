import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-4">🔍</div>
        <h1 className="text-3xl font-bold mb-2">Không tìm thấy trang</h1>
        <p className="text-slate-600 mb-6">
          Trang anh tìm có thể đã đổi địa chỉ hoặc tiệm chưa kích hoạt subdomain.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="rounded-md bg-brand-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-brand-700"
          >
            Về trang chủ
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium hover:bg-slate-50"
          >
            Đăng nhập
          </Link>
        </div>
        <p className="mt-6 text-xs text-slate-500">
          Cần hỗ trợ? Email <a href="mailto:support@hetcho.vn" className="text-brand-600 hover:underline">support@hetcho.vn</a>
        </p>
      </div>
    </main>
  );
}
