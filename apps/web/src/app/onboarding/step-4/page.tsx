import Link from 'next/link';
import { Stepper } from '../_components/stepper';

const DAYS = [
  { key: 'mon', label: 'Thứ 2', defaultOpen: true },
  { key: 'tue', label: 'Thứ 3', defaultOpen: true },
  { key: 'wed', label: 'Thứ 4', defaultOpen: true },
  { key: 'thu', label: 'Thứ 5', defaultOpen: true },
  { key: 'fri', label: 'Thứ 6', defaultOpen: true },
  { key: 'sat', label: 'Thứ 7', defaultOpen: true },
  { key: 'sun', label: 'Chủ nhật', defaultOpen: true },
];

export default function Step4Page() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Stepper current={4} />
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-2">Bước 4 — Giờ làm & Cao điểm</h2>
          <p className="text-sm text-slate-500 mb-6">
            Cấu hình giờ mở/đóng từng ngày + khung "cao điểm" (yêu cầu cọc cao hơn).
          </p>

          <form action="/onboarding/step-5" method="get" className="space-y-4">
            <fieldset className="border border-slate-200 rounded-lg p-4">
              <legend className="text-sm font-semibold px-2">Giờ làm việc</legend>
              <div className="space-y-2">
                {DAYS.map((d) => (
                  <div key={d.key} className="flex items-center gap-3">
                    <label className="flex items-center gap-2 w-28">
                      <input type="checkbox" defaultChecked={d.defaultOpen} name={`${d.key}_open`} />
                      <span className="font-medium">{d.label}</span>
                    </label>
                    <input type="time" name={`${d.key}_from`} defaultValue="08:00"
                      className="rounded-md border border-slate-300 px-2 py-1" />
                    <span className="text-slate-400">→</span>
                    <input type="time" name={`${d.key}_to`} defaultValue="22:00"
                      className="rounded-md border border-slate-300 px-2 py-1" />
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset className="border border-slate-200 rounded-lg p-4">
              <legend className="text-sm font-semibold px-2">Khung giờ cao điểm (peak)</legend>
              <p className="text-xs text-slate-500 mb-2">
                Trong khung này, hệ thống áp dụng "cọc cao điểm" để chống khách giữ chỗ rồi bỏ.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked /> <span>Thứ 7 14:00 — 22:00</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked /> <span>Chủ nhật 10:00 — 22:00</span>
                </div>
                <button type="button" className="text-brand-600 text-sm hover:underline">+ Thêm khung khác</button>
              </div>
            </fieldset>

            <fieldset className="border border-slate-200 rounded-lg p-4">
              <legend className="text-sm font-semibold px-2">Chính sách huỷ</legend>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm font-medium">Huỷ trước (giờ)</span>
                  <input type="number" name="refundHours" defaultValue={24} min={0} max={168}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
                  <p className="mt-1 text-xs text-slate-500">Hoàn 100% nếu huỷ trước thời gian này.</p>
                </label>
                <label className="block">
                  <span className="text-sm font-medium">Phí phạt (%)</span>
                  <input type="number" name="finePercent" defaultValue={50} min={0} max={100}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
                  <p className="mt-1 text-xs text-slate-500">Nếu huỷ trễ → giữ % này của cọc.</p>
                </label>
              </div>
            </fieldset>

            <div className="flex gap-3 pt-2">
              <Link href="/onboarding/step-3" className="rounded-md border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50">← Quay lại</Link>
              <button type="submit" className="flex-1 rounded-md bg-brand-600 px-4 py-3 font-medium text-white hover:bg-brand-700">
                Tiếp tục → Bước 5: Zalo OA
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
