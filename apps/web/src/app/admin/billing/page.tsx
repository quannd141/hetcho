import { AdminShell } from '../_components/admin-shell';

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

const STATS = [
  { label: 'MRR', value: fmtVnd(12_450_000), delta: '+18% MoM' },
  { label: 'ARR', value: fmtVnd(149_400_000), delta: 'Projection' },
  { label: 'Tiệm trả phí', value: '23 / 127', delta: '18% conversion' },
  { label: 'ARPU', value: fmtVnd(541_000), delta: 'Pro avg' },
];

const TRANSACTIONS = [
  { date: '2026-05-16', tenant: 'Mai Spa', plan: 'Pro tháng', amount: 299_000, gateway: 'VNPay', status: 'paid' as const },
  { date: '2026-05-16', tenant: 'Beauty House', plan: 'Pro tháng', amount: 299_000, gateway: 'VNPay', status: 'paid' as const },
  { date: '2026-05-15', tenant: 'Tonny Barber', plan: 'Free → Pro', amount: 299_000, gateway: 'MoMo', status: 'pending' as const },
  { date: '2026-05-14', tenant: 'Salon Hằng', plan: 'Pro tháng', amount: 299_000, gateway: 'VNPay', status: 'failed' as const },
  { date: '2026-05-12', tenant: 'Linh Nail', plan: 'Pro năm', amount: 2_990_000, gateway: 'VNPay', status: 'paid' as const },
  { date: '2026-05-10', tenant: 'Goi đầu Thư giãn', plan: 'Pro tháng', amount: 299_000, gateway: 'VNPay', status: 'paid' as const },
];

export default function AdminBillingPage() {
  return (
    <AdminShell active="billing">
      <h1 className="text-2xl font-bold mb-1">Doanh thu platform</h1>
      <p className="text-sm text-slate-500 mb-6">Stripe / VNPay / MoMo / ZaloPay aggregated.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STATS.map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className="text-xl font-bold mt-1">{s.value}</div>
            <div className="text-xs text-emerald-600 mt-1">{s.delta}</div>
          </div>
        ))}
      </div>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold">MRR 6 tháng gần nhất</h2>
        </div>
        <div className="p-6">
          <div className="flex items-end gap-4 h-40">
            {[3.2, 4.5, 6.1, 8.0, 9.8, 12.45].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end">
                <div
                  className="w-full bg-brand-500 rounded-t"
                  style={{ height: `${(v / 14) * 100}%` }}
                />
                <div className="text-xs text-slate-500 mt-2">T{12 + i > 12 ? i - 6 : 12 + i}</div>
                <div className="text-xs font-mono text-slate-700">{v}M</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold">Giao dịch gần nhất</h2>
          <div className="flex gap-2">
            <select className="rounded-md border border-slate-300 px-2 py-1 text-xs">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
              <option>90 ngày qua</option>
            </select>
            <button className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
              Export CSV
            </button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="text-left px-6 py-2 font-medium">Ngày</th>
              <th className="text-left px-3 py-2 font-medium">Tiệm</th>
              <th className="text-left px-3 py-2 font-medium">Gói</th>
              <th className="text-left px-3 py-2 font-medium">Gateway</th>
              <th className="text-right px-3 py-2 font-medium">Số tiền</th>
              <th className="text-left px-3 py-2 font-medium">Trạng thái</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {TRANSACTIONS.map((tx, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-mono text-xs">{tx.date}</td>
                <td className="px-3 py-3">{tx.tenant}</td>
                <td className="px-3 py-3 text-slate-600">{tx.plan}</td>
                <td className="px-3 py-3 text-xs">{tx.gateway}</td>
                <td className="px-3 py-3 text-right font-mono">{fmtVnd(tx.amount)}</td>
                <td className="px-3 py-3">
                  {tx.status === 'paid' && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Paid</span>}
                  {tx.status === 'pending' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Pending</span>}
                  {tx.status === 'failed' && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded">Failed</span>}
                </td>
                <td className="px-3 py-3 text-right">
                  <button className="text-xs text-brand-600 hover:underline">Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
