'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Sprint 1+ wire vào Supabase Auth signInWithOtp
    // hiện tại: stub UI
    console.info('[LOGIN-STUB] magic link to', email);
    setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Đăng nhập HếtChờ</h1>
        <p className="mt-2 text-sm text-slate-500">
          Gửi magic link qua email — không cần password.
        </p>

        {sent ? (
          <div className="mt-6 rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-900">
            ✅ Đã gửi magic link tới <strong>{email}</strong>. Check inbox + spam.
            <p className="mt-2 text-xs">(Stub Sprint 0 — Sprint 1 sẽ wire Supabase Auth thật)</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
                placeholder="ban@example.com"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-md bg-brand-600 px-4 py-2 text-white font-medium hover:bg-brand-700"
            >
              Gửi magic link
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
