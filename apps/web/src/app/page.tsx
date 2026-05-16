import Link from 'next/link';

const DEMO_TENANTS = [
  { slug: 'salon-hang', name: 'Salon Hằng Hair', type: '✂️ Salon tóc', city: 'TP.HCM' },
  { slug: 'mai-spa', name: 'Mai Skin Spa', type: '💆 Spa / Skincare', city: 'TP.HCM' },
  { slug: 'linh-nail', name: 'Linh Nail Studio', type: '💅 Nail', city: 'TP.HCM' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <header className="container mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-brand-600">HếtChờ</Link>
        <nav className="hidden md:flex gap-6 text-sm font-medium items-center">
          <Link href="#demo" className="hover:text-brand-600">Demo</Link>
          <Link href="#features" className="hover:text-brand-600">Tính năng</Link>
          <Link href="/login" className="hover:text-brand-600">Đăng nhập</Link>
          <Link href="/signup" className="rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">
            Dùng thử miễn phí
          </Link>
        </nav>
      </header>

      <section className="container mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full mb-4">
            🇻🇳 Made for Vietnam
          </span>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Đặt là <span className="text-brand-600">vào liền</span>.
          </h1>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            Nền tảng booking <strong>miễn phí 12 tháng</strong> cho salon tóc, spa, nail. Khách đặt qua <strong>Zalo Mini App</strong>,
            vào ghế đúng giờ — không còn xếp hàng chờ cả tiếng.
          </p>
          <div className="mt-8 flex gap-3 flex-wrap">
            <Link href="/signup" className="rounded-md bg-brand-600 px-6 py-3 text-white font-medium hover:bg-brand-700">
              Bắt đầu miễn phí →
            </Link>
            <Link href="#demo" className="rounded-md border border-slate-300 px-6 py-3 font-medium hover:bg-slate-50">
              Xem demo
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">Không cần thẻ tín dụng · Không phí ẩn · Huỷ bất cứ lúc nào</p>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-8 border border-orange-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-brand-600">0 ₫</div>
              <div className="text-xs text-slate-500 mt-1">Phí setup</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-brand-600">12 tháng</div>
              <div className="text-xs text-slate-500 mt-1">Miễn phí dùng</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-brand-600">70%</div>
              <div className="text-xs text-slate-500 mt-1">Giảm no-show</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-3xl font-bold text-brand-600">~10p</div>
              <div className="text-xs text-slate-500 mt-1">Setup tiệm</div>
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Demo click-through</h2>
            <p className="mt-2 text-slate-600">Click vào tiệm bất kỳ để xem dashboard + Mini App giả lập</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {DEMO_TENANTS.map((t) => (
              <div key={t.slug} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition">
                <div className="bg-gradient-to-br from-brand-500 to-brand-700 h-32 flex items-center justify-center text-white text-4xl">
                  {t.type.split(' ')[0]}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg">{t.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{t.type} · 📍 {t.city}</p>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <Link
                      href={`/${t.slug}/dashboard`}
                      className="flex-1 rounded-md bg-brand-600 px-3 py-2 text-white text-xs font-medium text-center hover:bg-brand-700"
                    >
                      Dashboard chủ tiệm
                    </Link>
                    <Link
                      href={`/${t.slug}/book`}
                      className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-center hover:bg-slate-50"
                    >
                      Web booking
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-sm text-slate-500 mb-3">Xem Mini App phiên bản di động (chạy local):</p>
            <code className="inline-block bg-slate-100 px-4 py-2 rounded text-sm font-mono">
              pnpm --filter @hetcho/mini-app dev
            </code>
            <p className="text-xs text-slate-400 mt-2">→ http://localhost:3001</p>
          </div>
        </div>
      </section>

      <section id="features" className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">6 tính năng MVP</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '📱', title: 'F1 — Đặt qua Zalo Mini App', body: 'Khách quen Zalo đặt 3 click, không cần app riêng.' },
            { icon: '📊', title: 'F2 — Dashboard ngày/tuần', body: 'Lịch realtime, sync Google Calendar, quản lý dịch vụ + thợ.' },
            { icon: '⚡', title: 'F3 — Realtime slot', body: 'Khách thấy slot trống — đặt đến đúng giờ vào liền.' },
            { icon: '💎', title: 'F4 — Tier + Liệu trình', body: 'Quản lý VIP/CIP, tracking gói spa 10 buổi.' },
            { icon: '🔔', title: 'F5 — Auto reminder + Recovery', body: 'Nhắc Zalo T-24h/T-2h. Voucher tự động khi khách lâu không đến.' },
            { icon: '💳', title: 'F6 — Đặt cọc giữ chỗ', body: 'VNPay cọc giờ cao điểm, giảm 70% no-show.' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-slate-600 mt-2">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-brand-600 py-16">
        <div className="container mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold">Sẵn sàng để khách "vào liền"?</h2>
          <p className="mt-3 opacity-90">5 phút setup. Miễn phí 12 tháng đầu.</p>
          <Link href="/signup" className="inline-block mt-6 rounded-md bg-white text-brand-700 px-8 py-3 font-medium hover:bg-slate-50">
            Bắt đầu miễn phí →
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-slate-500">
          <div className="font-bold text-brand-600 text-lg mb-2">HếtChờ</div>
          <p>© 2026 HếtChờ — Đặt là vào liền</p>
          <p className="text-xs mt-1">Phát triển bởi Quân Nguyễn · Quality First, Always.</p>
        </div>
      </footer>
    </main>
  );
}
