import Link from 'next/link';
import { TenantShell } from '../_components/tenant-shell';
import { demoCustomers } from '../_lib/demo-catalog';

interface PageProps { params: { slug: string } }

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

const TIER_COLOR: Record<string, string> = {
  vip: 'bg-amber-100 text-amber-800 border-amber-300',
  cip: 'bg-blue-100 text-blue-800 border-blue-300',
  normal: 'bg-slate-100 text-slate-600 border-slate-300',
};

const TIER_LABEL: Record<string, string> = {
  vip: '⭐ VIP',
  cip: '💎 CIP',
  normal: 'Normal',
};

export default function CustomersPage({ params }: PageProps) {
  const customers = demoCustomers(params.slug);
  const vip = customers.filter((c) => c.tier === 'vip').length;
  const cip = customers.filter((c) => c.tier === 'cip').length;

  return (
    <TenantShell slug={params.slug} active="customers">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Khách hàng ({customers.length})</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tier tự tính theo số lượt + chi tiêu. Lifecycle CRM lite — Sprint 7 sẽ thêm notes + sinh nhật.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-amber-700 font-medium">⭐ VIP: {vip}</span>
          <span className="text-blue-700 font-medium">💎 CIP: {cip}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <input
          type="search"
          placeholder="Tìm khách theo tên hoặc SĐT..."
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option>Tất cả tier</option>
          <option>VIP</option>
          <option>CIP</option>
          <option>Normal</option>
        </select>
        <select className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option>Tất cả nguồn</option>
          <option>Zalo Mini App</option>
          <option>Walk-in</option>
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Tên</th>
              <th className="px-4 py-3 font-semibold">SĐT</th>
              <th className="px-4 py-3 font-semibold">Tier</th>
              <th className="px-4 py-3 font-semibold text-right">Số lượt</th>
              <th className="px-4 py-3 font-semibold text-right">Tổng chi tiêu</th>
              <th className="px-4 py-3 font-semibold">Lần cuối</th>
              <th className="px-4 py-3 font-semibold">Nguồn</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{c.phoneMasked}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded border ${TIER_COLOR[c.tier]}`}>{TIER_LABEL[c.tier]}</span>
                </td>
                <td className="px-4 py-3 text-right">{c.totalBookings}</td>
                <td className="px-4 py-3 text-right font-mono">{fmtVnd(c.lifetimeSpendVnd)}</td>
                <td className="px-4 py-3 text-slate-500">{c.lastVisitAt}</td>
                <td className="px-4 py-3 text-xs">
                  {c.zaloId ? (
                    <span className="text-blue-600">📱 Zalo</span>
                  ) : (
                    <span className="text-slate-500">Walk-in</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/${params.slug}/customers/${c.id}`} className="text-brand-600 hover:underline text-xs">Chi tiết</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TenantShell>
  );
}
