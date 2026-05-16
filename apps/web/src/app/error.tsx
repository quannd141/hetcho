'use client';

import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (typeof console !== 'undefined') {
      console.error('[error-boundary]', error);
    }
  }, [error]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-4">⚠️</div>
        <h1 className="text-3xl font-bold mb-2">Có chuyện không hay xảy ra</h1>
        <p className="text-slate-600 mb-2">
          Hệ thống đang gặp lỗi tạm thời. Đội ngũ kỹ thuật đã được báo.
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 mb-6 font-mono">Mã lỗi: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-md bg-brand-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-brand-700"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium hover:bg-slate-50"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}
