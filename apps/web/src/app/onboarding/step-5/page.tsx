import Link from 'next/link';
import { Stepper } from '../_components/stepper';

export default function Step5Page() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Stepper current={5} />
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-2">Bước 5 — Kết nối Zalo OA</h2>
          <p className="text-sm text-slate-500 mb-6">
            Khách sẽ đặt lịch qua Zalo Mini App của tiệm bạn. Bước này tuỳ chọn — có thể bỏ qua và làm sau.
          </p>

          <div className="space-y-4">
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-1">📱 Bạn đã có Zalo OA?</p>
              <p className="text-sm text-blue-800">
                Đăng ký miễn phí tại{' '}
                <a href="https://oa.zalo.me" target="_blank" rel="noreferrer" className="underline font-medium">oa.zalo.me</a>.
                Sau khi có, copy OA ID vào đây.
              </p>
            </div>

            <label className="block">
              <span className="text-sm font-medium">Zalo OA ID (tuỳ chọn)</span>
              <input name="zaloOAId" placeholder="VD: 1234567890"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none" />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Mini App ID (tuỳ chọn)</span>
              <input name="zaloMiniAppId" placeholder="VD: 2882233557555444"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2" />
              <p className="mt-1 text-xs text-slate-500">Đăng ký tại mini.zalo.me. Cần link với OA ở trên.</p>
            </label>

            <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-amber-900 mb-1">⚠️ Chưa có Zalo OA?</p>
              <p className="text-sm text-amber-800">
                Không sao! Tiệm bạn vẫn có thể nhận booking qua web link
                <code className="bg-amber-100 px-1 mx-1 rounded">hetcho.vn/[slug]</code>
                và dashboard quản lý. Bạn có thể kết nối Zalo sau bất cứ lúc nào ở Cài đặt.
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Link href="/onboarding/step-4" className="rounded-md border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50">← Quay lại</Link>
              <Link href="/demo/dashboard" className="rounded-md border border-slate-300 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Bỏ qua (làm sau)
              </Link>
              <Link href="/demo/dashboard" className="flex-1 rounded-md bg-brand-600 px-4 py-3 font-medium text-white text-center hover:bg-brand-700">
                Hoàn tất → Vào Dashboard
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Onboarding stub — sẽ wire CreateTenantUseCase + AddServiceUseCase + AddStaffUseCase khi PH-001 (Supabase) xong.
        </p>
      </div>
    </main>
  );
}
