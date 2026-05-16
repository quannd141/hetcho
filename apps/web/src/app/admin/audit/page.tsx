import { AdminShell } from '../_components/admin-shell';

const LOGS = [
  { time: '2026-05-16 14:32:11', actor: 'quan@hetcho.vn', action: 'tenant.override_plan', target: 'mai-spa', detail: 'Pro 3 tháng (pilot partner)', level: 'audit' as const },
  { time: '2026-05-16 11:08:42', actor: 'system', action: 'cron.reminder_24h', target: '187 bookings', detail: 'success', level: 'info' as const },
  { time: '2026-05-16 09:15:30', actor: 'quan@hetcho.vn', action: 'admin.impersonate', target: 'beauty-house', detail: 'support ticket #234', level: 'audit' as const },
  { time: '2026-05-15 22:45:18', actor: 'hang@salon-hang.vn', action: 'tenant.upgrade_plan', target: 'salon-hang', detail: 'Free → Pro tháng', level: 'info' as const },
  { time: '2026-05-15 20:12:55', actor: 'system', action: 'webhook.vnpay_failed', target: 'tx_a1b2c3', detail: 'gateway 504 timeout', level: 'warning' as const },
  { time: '2026-05-15 18:30:42', actor: 'quan@hetcho.vn', action: 'admin.suspend_tenant', target: 'beauty-house', detail: 'phản ánh khách hàng', level: 'audit' as const },
  { time: '2026-05-15 14:05:33', actor: 'system', action: 'auth.failed_login_5x', target: 'user@example.com', detail: 'IP 113.190.x.x — locked 15min', level: 'warning' as const },
  { time: '2026-05-15 11:22:08', actor: 'mai@mai-spa.vn', action: 'staff.created', target: 'st_xyz789', detail: 'Thợ mới: Trang KTV', level: 'info' as const },
  { time: '2026-05-14 16:48:21', actor: 'system', action: 'rls.policy_violation', target: 'tenant_a tried tenant_b', detail: 'blocked by Postgres', level: 'error' as const },
  { time: '2026-05-14 09:30:00', actor: 'quan@hetcho.vn', action: 'admin.export_tenants', target: 'CSV 127 rows', detail: 'GDPR DPO request', level: 'audit' as const },
];

export default function AdminAuditPage() {
  return (
    <AdminShell active="audit">
      <h1 className="text-2xl font-bold mb-1">Audit log</h1>
      <p className="text-sm text-slate-500 mb-6">Mọi hành động Super Admin + sự kiện bảo mật.</p>

      <div className="flex items-center gap-3 mb-4">
        <input type="search" placeholder="Tìm theo actor / action / target..." className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <select className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option>Mọi mức độ</option>
          <option>Audit (admin actions)</option>
          <option>Info</option>
          <option>Warning</option>
          <option>Error</option>
        </select>
        <select className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option>24 giờ qua</option>
          <option>7 ngày qua</option>
          <option>30 ngày qua</option>
        </select>
        <button className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
          Export
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="text-left px-6 py-3 font-medium">Thời gian</th>
              <th className="text-left px-3 py-3 font-medium">Actor</th>
              <th className="text-left px-3 py-3 font-medium">Hành động</th>
              <th className="text-left px-3 py-3 font-medium">Target</th>
              <th className="text-left px-3 py-3 font-medium">Chi tiết</th>
              <th className="text-left px-3 py-3 font-medium">Mức</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {LOGS.map((log, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-6 py-2.5 font-mono text-xs">{log.time}</td>
                <td className="px-3 py-2.5 text-xs">{log.actor}</td>
                <td className="px-3 py-2.5 font-mono text-xs">{log.action}</td>
                <td className="px-3 py-2.5 text-xs">{log.target}</td>
                <td className="px-3 py-2.5 text-xs text-slate-600">{log.detail}</td>
                <td className="px-3 py-2.5">
                  {log.level === 'audit' && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Audit</span>}
                  {log.level === 'info' && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Info</span>}
                  {log.level === 'warning' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Warning</span>}
                  {log.level === 'error' && <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded">Error</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
