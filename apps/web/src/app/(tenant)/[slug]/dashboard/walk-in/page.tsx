import Link from 'next/link';

interface PageProps {
  params: { slug: string };
}

export default function WalkInPage({ params }: PageProps) {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="text-xl font-bold text-brand-600">HếtChờ</Link>
          <span className="text-slate-300">|</span>
          <Link href={`/${params.slug}/dashboard`} className="text-sm text-slate-600 hover:underline">
            ← Quay về Lịch
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">Thêm khách walk-in</h1>
        <p className="text-sm text-slate-500 mb-6">
          Khách đến trực tiếp (không qua Mini App). Hệ thống sẽ tự lưu vào danh sách khách hàng.
        </p>

        <form
          className="space-y-4 bg-white border border-slate-200 rounded-xl p-6"
          action={`/${params.slug}/dashboard`}
          method="get"
        >
          <label className="block">
            <span className="text-sm font-medium">Tên khách</span>
            <input
              required
              name="customerName"
              placeholder="VD: Chị Hoa"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Số điện thoại</span>
            <input
              required
              name="phone"
              pattern="0\d{9}"
              placeholder="0901234567"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">10 chữ số, bắt đầu bằng 0. Lưu hashed để bảo vệ quyền riêng tư.</p>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Dịch vụ</span>
              <select
                required
                name="serviceId"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              >
                <option value="">— Chọn —</option>
                <option value="demo-cat-goi">Cắt + Gội</option>
                <option value="demo-uon">Uốn / Duỗi</option>
                <option value="demo-massage">Chăm da mặt</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Thợ / KTV</span>
              <select
                required
                name="staffId"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              >
                <option value="">— Chọn —</option>
                <option value="staff-tu">Stylist Tú</option>
                <option value="staff-ngoc">Stylist Ngọc</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Bắt đầu lúc</span>
            <input
              required
              type="datetime-local"
              name="startAt"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 rounded-md bg-brand-600 px-4 py-3 font-medium text-white hover:bg-brand-700"
            >
              Tạo booking
            </button>
            <Link
              href={`/${params.slug}/dashboard`}
              className="rounded-md border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50"
            >
              Huỷ
            </Link>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Sprint 2 stub — sẽ gọi WalkInBookingUseCase qua server action khi PH-001 (Supabase) xong.
          </p>
        </form>
      </div>
    </main>
  );
}
