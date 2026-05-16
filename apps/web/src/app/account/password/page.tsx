import { AccountShell } from '../_components/account-shell';

export default function AccountPasswordPage() {
  return (
    <AccountShell active="password">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100">
          <h1 className="text-xl font-bold">Đổi mật khẩu</h1>
          <p className="text-sm text-slate-500 mt-1">
            HếtChờ dùng magic link là chính, nhưng anh có thể đặt password để đăng nhập nhanh trên thiết bị riêng.
          </p>
        </div>

        <form className="p-6 space-y-4 max-w-md">
          <label className="block">
            <span className="text-sm font-medium">Mật khẩu hiện tại</span>
            <input
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">
              Bỏ trống nếu lần đầu đặt mật khẩu (vẫn dùng magic link).
            </p>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Mật khẩu mới *</span>
            <input
              required
              type="password"
              autoComplete="new-password"
              minLength={8}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">Tối thiểu 8 ký tự, có chữ + số.</p>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Xác nhận mật khẩu mới *</span>
            <input
              required
              type="password"
              autoComplete="new-password"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
            ⚠️ Sau khi đổi, mọi session đang đăng nhập sẽ bị thu hồi. Anh phải đăng nhập lại trên mọi thiết bị.
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-brand-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-brand-700"
          >
            Cập nhật mật khẩu
          </button>
        </form>
      </div>
    </AccountShell>
  );
}
