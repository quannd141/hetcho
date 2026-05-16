import Link from 'next/link';
import { Stepper } from '../_components/stepper';

export default function Step3Page() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Stepper current={3} />
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-2">Bước 3 — Thợ / KTV</h2>
          <p className="text-sm text-slate-500 mb-6">
            Thêm ít nhất 1 người (có thể là chủ tiệm). Khách sẽ chọn người này khi đặt lịch.
          </p>

          <form action="/onboarding/step-4" method="get" className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Tên thợ / KTV *</span>
              <input required name="staffName" placeholder="VD: Hằng (chủ) hoặc Stylist Tú"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Vai trò (hiển thị tuỳ loại tiệm)</span>
              <select name="role" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2">
                <option>Stylist</option>
                <option>KTV (Kỹ thuật viên)</option>
                <option>Thợ</option>
                <option>Chủ tiệm</option>
                <option>Master</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Ảnh đại diện (tuỳ chọn)</span>
              <div className="mt-1 flex items-center gap-3">
                <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-full flex items-center justify-center text-slate-400">
                  👤
                </div>
                <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                  Upload ảnh
                </button>
                <span className="text-xs text-slate-500">(Sprint 7 polish)</span>
              </div>
            </label>

            <fieldset className="border border-slate-200 rounded-lg p-4">
              <legend className="text-sm font-semibold px-2">Có thể làm dịch vụ nào?</legend>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span>Cắt + Gội + Sấy (vừa tạo ở Bước 2)</span>
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  Sau khi onboarding xong, bạn có thể thêm thợ và cấu hình từng người làm dịch vụ nào.
                </p>
              </div>
            </fieldset>

            <div className="flex gap-3 pt-2">
              <Link href="/onboarding/step-2" className="rounded-md border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50">← Quay lại</Link>
              <button type="submit" className="flex-1 rounded-md bg-brand-600 px-4 py-3 font-medium text-white hover:bg-brand-700">
                Tiếp tục → Bước 4: Giờ làm
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
