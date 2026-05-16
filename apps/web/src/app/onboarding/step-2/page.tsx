import Link from 'next/link';
import { Stepper } from '../_components/stepper';

export default function Step2Page() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Stepper current={2} />
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-2">Bước 2 — Dịch vụ đầu tiên</h2>
          <p className="text-sm text-slate-500 mb-6">
            Bạn có thể thêm dịch vụ khác sau. Hiện tại chỉ cần 1 dịch vụ để demo flow đặt lịch.
          </p>

          <form action="/onboarding/step-3" method="get" className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Tên dịch vụ *</span>
              <input required name="serviceName" placeholder="VD: Cắt + Gội + Sấy"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Thời lượng (phút) *</span>
                <select required name="duration" defaultValue="60" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2">
                  <option value="30">30 phút</option>
                  <option value="45">45 phút</option>
                  <option value="60">60 phút</option>
                  <option value="90">90 phút</option>
                  <option value="120">120 phút</option>
                  <option value="180">3 giờ</option>
                  <option value="240">4 giờ</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Danh mục</span>
                <input name="category" placeholder="Tóc / Skincare / Nail"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium">Giá (VND) *</span>
              <input required type="number" name="priceVnd" defaultValue={250000} step={10000} min={0}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
              <p className="mt-1 text-xs text-slate-500">Giá hiển thị cho khách trên Mini App.</p>
            </label>

            <fieldset className="border border-slate-200 rounded-lg p-4">
              <legend className="text-sm font-semibold px-2">Cọc giữ chỗ (F6 — chống no-show)</legend>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium">Cọc giờ thường</span>
                  <input type="number" name="depositNormal" defaultValue={0} step={10000} min={0}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
                  <p className="mt-1 text-xs text-slate-500">0 = không yêu cầu cọc.</p>
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Cọc giờ cao điểm</span>
                  <input type="number" name="depositPeak" defaultValue={50000} step={10000} min={0}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
                </label>
              </div>
            </fieldset>

            <div className="flex gap-3 pt-2">
              <Link href="/onboarding/step-1" className="rounded-md border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50">← Quay lại</Link>
              <button type="submit" className="flex-1 rounded-md bg-brand-600 px-4 py-3 font-medium text-white hover:bg-brand-700">
                Tiếp tục → Bước 3: Thợ / KTV
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
