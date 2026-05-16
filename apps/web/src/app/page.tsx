import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="container mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-brand-600">
          HếtChờ
        </Link>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="/features" className="hover:text-brand-600">Tính năng</Link>
          <Link href="/pricing" className="hover:text-brand-600">Giá</Link>
          <Link href="/login" className="hover:text-brand-600">Đăng nhập</Link>
          <Link href="/signup" className="rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">
            Dùng thử miễn phí
          </Link>
        </nav>
      </header>

      <section className="container mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center flex-1">
        <div>
          <h1 className="text-5xl font-bold leading-tight">
            Đặt là <span className="text-brand-600">vào liền</span>.
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Nền tảng booking <strong>miễn phí 12 tháng</strong> cho salon tóc, spa, nail, gội đầu. Khách của bạn đặt qua Zalo Mini App,
            vào ghế đúng giờ — không còn xếp hàng chờ cả tiếng.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/signup"
              className="rounded-md bg-brand-600 px-6 py-3 text-white font-medium hover:bg-brand-700"
            >
              Bắt đầu miễn phí
            </Link>
            <Link
              href="/demo"
              className="rounded-md border border-slate-300 px-6 py-3 font-medium hover:bg-slate-50"
            >
              Xem demo
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">Không cần thẻ tín dụng. Không phí ẩn. Hủy bất cứ lúc nào.</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-8 border border-slate-200">
          <h3 className="font-semibold text-lg">Tính năng MVP (Sprint 1-4)</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2"><span className="text-brand-600">✓</span> Đặt lịch qua Zalo Mini App</li>
            <li className="flex gap-2"><span className="text-brand-600">✓</span> Dashboard ngày/tuần, sync Google Calendar</li>
            <li className="flex gap-2"><span className="text-brand-600">✓</span> Realtime slot còn trống — không trùng lịch</li>
            <li className="flex gap-2"><span className="text-brand-600">✓</span> Đặt cọc giữ chỗ cao điểm — giảm 70% no-show</li>
            <li className="flex gap-2"><span className="text-brand-600">✓</span> Tier khách + track liệu trình spa</li>
            <li className="flex gap-2"><span className="text-brand-600">✓</span> Auto nhắc Zalo + Recovery 30/60/90 ngày</li>
          </ul>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        © 2026 HếtChờ. Phát triển bởi Quân Nguyễn.
      </footer>
    </main>
  );
}
