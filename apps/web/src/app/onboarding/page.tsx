import Link from 'next/link';

const STEPS = [
  { id: 1, label: 'Thông tin tiệm', status: 'done' as const },
  { id: 2, label: 'Thêm dịch vụ đầu tiên', status: 'current' as const },
  { id: 3, label: 'Thêm thợ / KTV', status: 'pending' as const },
  { id: 4, label: 'Cấu hình giờ làm + slot peak', status: 'pending' as const },
  { id: 5, label: 'Kết nối Zalo OA (skip nếu chưa có)', status: 'pending' as const },
];

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Chào mừng đến HếtChờ! 🎉</h1>
          <p className="mt-2 text-slate-600">5 bước setup tiệm — mất ~10 phút.</p>
        </header>

        <ol className="space-y-3">
          {STEPS.map((s) => (
            <li
              key={s.id}
              className={`flex items-center gap-4 rounded-xl border p-4 ${
                s.status === 'current'
                  ? 'border-brand-500 bg-white'
                  : s.status === 'done'
                  ? 'border-green-300 bg-green-50'
                  : 'border-slate-200 bg-white opacity-60'
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                  s.status === 'current'
                    ? 'bg-brand-600 text-white'
                    : s.status === 'done'
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {s.status === 'done' ? '✓' : s.id}
              </div>
              <span className="flex-1 font-medium">{s.label}</span>
              {s.status === 'current' && (
                <Link
                  href={`/onboarding/step-${s.id}`}
                  className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
                >
                  Tiếp tục
                </Link>
              )}
            </li>
          ))}
        </ol>

        <p className="mt-8 text-sm text-slate-500 text-center">
          Sprint 0 stub — Sprint 1 sẽ implement từng step với form thật + gọi CreateTenantUseCase / AddServiceUseCase.
        </p>
      </div>
    </main>
  );
}
