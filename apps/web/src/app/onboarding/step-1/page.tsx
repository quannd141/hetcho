import Link from 'next/link';
import { Stepper } from '../_components/stepper';

const TENANT_TYPES = [
  { value: 'salon_toc', label: 'Salon tóc (slot 30m, ghế)' },
  { value: 'spa_skincare', label: 'Spa / Skincare (slot 60m, giường)' },
  { value: 'nail', label: 'Nail (slot 30m, bàn)' },
  { value: 'goi_dau', label: 'Gội đầu dưỡng sinh (slot 30m, ghế)' },
  { value: 'barber', label: 'Barber (slot 30m, ghế)' },
  { value: 'massage', label: 'Massage (slot 60m, giường)' },
];

export default function Step1Page() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Stepper current={1} />
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-2">Bước 1 — Thông tin tiệm</h2>
          <p className="text-sm text-slate-500 mb-6">
            Chúng tôi sẽ tự cấu hình mặc định theo loại tiệm (slot, working hours, peak windows). Bạn có thể chỉnh sau ở Cài đặt.
          </p>

          <form action="/onboarding/step-2" method="get" className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Tên tiệm *</span>
              <input
                required
                name="name"
                placeholder="VD: Salon Hằng Hair"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Loại tiệm *</span>
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
              <span className="text-sm font-medium">Slug URL (hetcho.vn/...) *</span>
              <input
                required
                name="slug"
                pattern="[a-z0-9-]+"
                placeholder="salon-cua-toi"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Thành phố</span>
                <select name="city" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2">
                  <option>Hà Nội</option>
                  <option>TP. HCM</option>
                  <option>Đà Nẵng</option>
                  <option>Khác</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Số ghế / giường / bàn</span>
                <input type="number" name="capacity" defaultValue={3} min={1} max={20}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium">Địa chỉ tiệm</span>
              <input name="address" placeholder="Số nhà, đường, quận/huyện"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
            </label>

            <div className="flex gap-3 pt-2">
              <Link href="/onboarding" className="rounded-md border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50">← Quay lại</Link>
              <button type="submit" className="flex-1 rounded-md bg-brand-600 px-4 py-3 font-medium text-white hover:bg-brand-700">
                Tiếp tục → Bước 2: Dịch vụ
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
