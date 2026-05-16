import Link from 'next/link';
import { AdminShell } from '../../_components/admin-shell';

interface PageProps { params: { slug: string } }

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export default function AdminTenantDetailPage({ params }: PageProps) {
  return (
    <AdminShell active="tenants">
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link href="/admin/tenants" className="text-slate-500 hover:text-slate-700">← Tiệm</Link>
        <span className="text-slate-300">/</span>
        <span className="font-medium font-mono">{params.slug}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Salon Hằng</h1>
          <p className="text-sm text-slate-500 mt-1">
            Owner: <strong>Hằng Nguyễn</strong> · 0901xxx234 · hang@salon-hang.vn · ID:{' '}
            <span className="font-mono">ten_a1b2c3</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/${params.slug}/dashboard`}
            target="_blank"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            🔑 Impersonate
          </Link>
          <button className="rounded-md border border-amber-300 text-amber-700 px-3 py-1.5 text-sm hover:bg-amber-50">
            Tạm khoá
          </button>
          <button className="rounded-md border border-rose-300 text-rose-700 px-3 py-1.5 text-sm hover:bg-rose-50">
            Xoá vĩnh viễn
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat label="Gói hiện tại" value="Free" sub="Đăng ký Pro để xem MRR" />
        <Stat label="Booking 30d" value="124" sub="+18% MoM" />
        <Stat label="GMV 30d" value={fmtVnd(28_750_000)} sub="Khách thanh toán cọc" />
        <Stat label="No-show rate" value="3.2%" sub="Thấp hơn TB platform (5%)" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold">Hoạt động gần đây</h2>
            </div>
            <ul className="divide-y divide-slate-100 text-sm">
              <ActivityItem time="14:32 hôm nay" event="Tạo booking BK-2845 (Cắt + Nhuộm)" />
              <ActivityItem time="13:15 hôm nay" event="Khách walk-in được thêm — Trần Thị B" />
              <ActivityItem time="11:40 hôm nay" event="Nâng cấp gói: Free → Pro (giao dịch VNPay)" highlight />
              <ActivityItem time="Hôm qua 20:10" event="Cấu hình giờ làm việc (mở Chủ nhật)" />
              <ActivityItem time="Hôm qua 18:22" event="Thêm dịch vụ mới: 'Phục hồi tóc Olaplex'" />
              <ActivityItem time="2 ngày trước" event="Liên kết Google Calendar thành công" />
            </ul>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold">Lịch sử thanh toán platform fee</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs">
                <tr>
                  <th className="text-left px-6 py-2 font-medium">Ngày</th>
                  <th className="text-left px-3 py-2 font-medium">Gói</th>
                  <th className="text-right px-3 py-2 font-medium">Số tiền</th>
                  <th className="text-left px-3 py-2 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-6 py-2">2026-05-01</td>
                  <td className="px-3 py-2">Pro tháng</td>
                  <td className="px-3 py-2 text-right font-mono">{fmtVnd(299_000)}</td>
                  <td className="px-3 py-2"><span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Paid</span></td>
                </tr>
                <tr>
                  <td className="px-6 py-2">2026-04-01</td>
                  <td className="px-3 py-2">Pro tháng</td>
                  <td className="px-3 py-2 text-right font-mono">{fmtVnd(299_000)}</td>
                  <td className="px-3 py-2"><span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Paid</span></td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <h2 className="font-bold mb-3">Override gói</h2>
            <p className="text-xs text-slate-500 mb-3">
              Tặng tháng Pro miễn phí (pilot partner / compensation).
            </p>
            <select className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm mb-2">
              <option>Pro — 1 tháng</option>
              <option>Pro — 3 tháng</option>
              <option>Pro — 6 tháng</option>
              <option>Pro — 12 tháng</option>
            </select>
            <input
              placeholder="Lý do (ghi audit log)..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm mb-3"
            />
            <button className="w-full rounded-md bg-amber-600 text-white px-3 py-2 text-sm font-medium hover:bg-amber-700">
              Áp dụng
            </button>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <h2 className="font-bold mb-3">Cờ rủi ro</h2>
            <ul className="text-sm space-y-2">
              <li className="flex items-center justify-between">
                <span>No-show rate cao</span>
                <span className="text-xs text-slate-400">3.2% (OK)</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Khách phàn nàn (90d)</span>
                <span className="text-xs text-slate-400">0</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Chargeback VNPay</span>
                <span className="text-xs text-slate-400">0</span>
              </li>
              <li className="flex items-center justify-between">
                <span>SLA uptime</span>
                <span className="text-xs text-emerald-600">99.94%</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

function ActivityItem({ time, event, highlight }: { time: string; event: string; highlight?: boolean }) {
  return (
    <li className={`px-6 py-3 ${highlight ? 'bg-amber-50' : ''}`}>
      <div className="text-xs text-slate-400">{time}</div>
      <div className="mt-0.5">{event}</div>
    </li>
  );
}
