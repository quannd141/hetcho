import Link from 'next/link';
import { Stepper } from './_components/stepper';

export default function OnboardingIntroPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Chào mừng đến HếtChờ! 🎉</h1>
          <p className="mt-2 text-slate-600">5 bước setup tiệm — mất ~10 phút. Bạn có thể skip bước cuối nếu chưa có Zalo OA.</p>
        </header>

        <Stepper current={1} />

        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Sẵn sàng để bắt đầu?</h2>
          <p className="text-slate-500 mb-6">Sau 10 phút bạn có thể nhận booking đầu tiên qua Zalo Mini App + dashboard.</p>
          <Link
            href="/onboarding/step-1"
            className="inline-flex rounded-md bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
          >
            Bắt đầu →
          </Link>
        </div>
      </div>
    </main>
  );
}
