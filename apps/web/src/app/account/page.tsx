import { AccountShell } from './_components/account-shell';

export default function AccountProfilePage() {
  return (
    <AccountShell active="profile">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100">
          <h1 className="text-xl font-bold">Hồ sơ chủ tiệm</h1>
          <p className="text-sm text-slate-500 mt-1">Thông tin hiển thị với khách + team của tiệm.</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-bold">
              HN
            </div>
            <div className="flex-1">
              <button className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
                Đổi ảnh đại diện
              </button>
              <p className="text-xs text-slate-500 mt-2">JPG / PNG, tối đa 2MB. Hiển thị với khách trên Mini App.</p>
            </div>
          </div>

          <form className="grid md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Họ và tên *</span>
              <input
                required
                defaultValue="Hằng Nguyễn"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Số điện thoại</span>
              <input
                defaultValue="0901234567"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Email *</span>
              <input
                required
                type="email"
                defaultValue="hang@salon-hang.vn"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Email magic link đăng nhập.</p>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Vai trò</span>
              <input
                disabled
                defaultValue="Chủ tiệm (Owner)"
                className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-medium">Bio ngắn (hiển thị trên Mini App)</span>
              <textarea
                rows={3}
                defaultValue="Stylist 12 năm kinh nghiệm, chuyên uốn duỗi + nhuộm Hàn Quốc."
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </form>

          <div className="border-t border-slate-100 pt-5">
            <h2 className="text-sm font-semibold mb-3">Liên kết Zalo</h2>
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <p className="text-sm font-medium">Zalo: <span className="font-mono">0901234567</span></p>
                <p className="text-xs text-slate-500">Liên kết để nhận push thông báo + đăng nhập 1-tap.</p>
              </div>
              <button className="text-sm text-rose-600 hover:underline">Gỡ liên kết</button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">Huỷ</button>
            <button className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </AccountShell>
  );
}
