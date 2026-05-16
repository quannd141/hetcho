'use client';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="vi">
      <body className="bg-white text-slate-900 antialiased">
        <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="text-7xl mb-4">💥</div>
            <h1 className="text-3xl font-bold mb-2">Lỗi nghiêm trọng</h1>
            <p className="text-slate-600 mb-2">
              Hệ thống không phản hồi. Vui lòng thử lại sau ít phút.
            </p>
            {error.digest && (
              <p className="text-xs text-slate-400 mb-6 font-mono">Mã lỗi: {error.digest}</p>
            )}
            <button
              onClick={reset}
              className="rounded-md bg-orange-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-orange-700"
            >
              Khởi động lại
            </button>
            <p className="mt-6 text-xs text-slate-500">
              Báo lỗi: <a href="mailto:support@hetcho.vn" className="underline">support@hetcho.vn</a>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
