import { AccountShell } from '../_components/account-shell';

const SESSIONS = [
  { device: 'Chrome — Windows 11', location: 'TP.HCM', lastActive: 'Đang hoạt động', current: true },
  { device: 'Safari — iPhone 15', location: 'TP.HCM', lastActive: '2 giờ trước', current: false },
  { device: 'Chrome — Macbook Air', location: 'Hà Nội', lastActive: '3 ngày trước', current: false },
];

const LOGIN_HISTORY = [
  { time: '2026-05-16 09:15', ip: '113.190.x.x', device: 'Chrome Windows', status: 'success' as const },
  { time: '2026-05-15 21:40', ip: '113.190.x.x', device: 'Safari iPhone', status: 'success' as const },
  { time: '2026-05-15 14:02', ip: '14.232.x.x', device: 'Chrome Mac', status: 'success' as const },
  { time: '2026-05-14 11:30', ip: '171.234.x.x', device: 'Unknown', status: 'failed' as const },
];

export default function AccountSecurityPage() {
  return (
    <AccountShell active="security">
      <div className="space-y-6">
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <h1 className="text-xl font-bold">Bảo mật 2 lớp (2FA)</h1>
            <p className="text-sm text-slate-500 mt-1">Tăng độ an toàn bằng OTP gửi qua SMS hoặc Zalo.</p>
          </div>
          <div className="p-6 space-y-3">
            <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="radio" name="2fa" defaultChecked className="mt-1" />
              <div className="flex-1">
                <div className="font-medium text-sm">Tắt 2FA</div>
                <div className="text-xs text-slate-500">Không khuyến nghị nếu tiệm có nhân viên dùng chung tài khoản.</div>
              </div>
            </label>
            <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="radio" name="2fa" className="mt-1" />
              <div className="flex-1">
                <div className="font-medium text-sm">OTP qua Zalo (khuyến nghị)</div>
                <div className="text-xs text-slate-500">Mã 6 số gửi vào Zalo OA của HếtChờ. Miễn phí.</div>
              </div>
            </label>
            <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
              <input type="radio" name="2fa" className="mt-1" />
              <div className="flex-1">
                <div className="font-medium text-sm">OTP qua SMS</div>
                <div className="text-xs text-slate-500">Mã 6 số gửi qua SMS. Có phí 200đ/lần (tính vào gói tiệm).</div>
              </div>
            </label>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Phiên đăng nhập</h2>
              <p className="text-sm text-slate-500 mt-1">Thiết bị đang đăng nhập vào tài khoản của anh.</p>
            </div>
            <button className="text-sm text-rose-600 hover:underline">Đăng xuất tất cả</button>
          </div>
          <ul className="divide-y divide-slate-100">
            {SESSIONS.map((s, i) => (
              <li key={i} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">
                    {s.device}
                    {s.current && (
                      <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                        Phiên hiện tại
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {s.location} · {s.lastActive}
                  </div>
                </div>
                {!s.current && (
                  <button className="text-sm text-rose-600 hover:underline">Đăng xuất</button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-bold">Lịch sử đăng nhập</h2>
            <p className="text-sm text-slate-500 mt-1">10 lần gần nhất.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Thời gian</th>
                  <th className="text-left px-6 py-3 font-medium">IP</th>
                  <th className="text-left px-6 py-3 font-medium">Thiết bị</th>
                  <th className="text-left px-6 py-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {LOGIN_HISTORY.map((h, i) => (
                  <tr key={i}>
                    <td className="px-6 py-3 font-mono text-xs">{h.time}</td>
                    <td className="px-6 py-3 font-mono text-xs">{h.ip}</td>
                    <td className="px-6 py-3">{h.device}</td>
                    <td className="px-6 py-3">
                      {h.status === 'success' ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">Thành công</span>
                      ) : (
                        <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-xs">Thất bại</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white border border-rose-200 rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-rose-100">
            <h2 className="text-lg font-bold text-rose-700">Khu vực nguy hiểm</h2>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Xoá tài khoản vĩnh viễn</div>
                <div className="text-xs text-slate-500">Mọi tiệm + dữ liệu khách + lịch sử sẽ bị xoá. Không khôi phục được.</div>
              </div>
              <button className="rounded-md border border-rose-300 text-rose-700 px-3 py-1.5 text-sm hover:bg-rose-50">
                Xoá tài khoản
              </button>
            </div>
          </div>
        </section>
      </div>
    </AccountShell>
  );
}
