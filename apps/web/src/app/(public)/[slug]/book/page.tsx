import Link from 'next/link';

interface PageProps { params: { slug: string }; searchParams: { date?: string; staffId?: string } }

const SAMPLE_SERVICES = [
  { id: 'sv-1', name: 'Cắt + Gội + Sấy', duration: 60, priceVnd: 250_000 },
  { id: 'sv-2', name: 'Nhuộm tóc', duration: 180, priceVnd: 800_000 },
  { id: 'sv-3', name: 'Uốn duỗi', duration: 240, priceVnd: 1_200_000 },
];

const SAMPLE_STAFF = [
  { id: 'st-1', name: 'Hằng (chủ)', rating: 4.9 },
  { id: 'st-2', name: 'Stylist Tú', rating: 4.7 },
  { id: 'st-3', name: 'Stylist Ngọc', rating: 4.6 },
];

const SAMPLE_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export default function PublicBookingPage({ params }: PageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <header className="container mx-auto px-6 py-4 flex items-center justify-between bg-white border-b border-slate-200">
        <Link href="/" className="text-xl font-bold text-brand-600">HếtChờ</Link>
        <div className="text-sm text-slate-500">Đặt lịch tại <strong>{params.slug}</strong></div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-1">Đặt lịch nhanh</h1>
          <p className="text-sm text-slate-500 mb-6">
            Không có Zalo? Đặt qua web cũng được. Mọi tin xác nhận sẽ gửi qua SMS.
          </p>

          <form action={`/${params.slug}/book/success`} method="get" className="space-y-5">
            <div>
              <label className="text-sm font-medium block mb-2">1. Chọn dịch vụ *</label>
              <div className="space-y-2">
                {SAMPLE_SERVICES.map((s, i) => (
                  <label key={s.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:border-brand-300 cursor-pointer">
                    <input type="radio" name="serviceId" value={s.id} defaultChecked={i === 0} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.duration} phút</div>
                    </div>
                    <div className="font-mono font-semibold text-brand-700">{fmtVnd(s.priceVnd)}</div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">2. Chọn thợ / KTV</label>
              <select name="staffId" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="any">Bất kỳ (auto-assign)</option>
                {SAMPLE_STAFF.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} (⭐ {s.rating})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-2">3. Ngày *</label>
                <input required type="date" name="date" defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">4. Giờ *</label>
                <select required name="time" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                  <option value="">— Chọn giờ —</option>
                  {SAMPLE_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h3 className="font-semibold mb-3">5. Thông tin của bạn</h3>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium">Họ tên *</span>
                  <input required name="customerName" placeholder="VD: Nguyễn Văn A"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Số điện thoại *</span>
                  <input required name="phone" type="tel" pattern="0\d{9}" placeholder="0901234567"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                  <p className="text-xs text-slate-500 mt-1">Tiệm gửi xác nhận qua SMS</p>
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Ghi chú (tuỳ chọn)</span>
                  <textarea name="note" rows={2} placeholder="VD: tóc dài ngang vai, dị ứng amoniac…"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              💡 <strong>Mẹo</strong>: Đặt qua Zalo Mini App nhanh hơn — không cần điền lại SĐT mỗi lần.
            </div>

            <button type="submit" className="w-full rounded-md bg-brand-600 text-white px-4 py-3 font-medium hover:bg-brand-700">
              Đặt lịch ngay
            </button>

            <p className="text-xs text-slate-500 text-center">
              Bằng việc đặt, bạn đồng ý với <a href="#" className="text-brand-600 hover:underline">chính sách huỷ</a> của tiệm.
            </p>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Đã có tài khoản Zalo? <Link href={`/${params.slug}`} className="text-brand-600 hover:underline">Mở Mini App nhanh hơn</Link>
        </p>
      </div>
    </main>
  );
}
