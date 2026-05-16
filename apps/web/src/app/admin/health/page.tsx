import { AdminShell } from '../_components/admin-shell';

const SERVICES = [
  { name: 'Web (Vercel)', uptime: '99.97%', latency: '142ms', status: 'healthy' as const },
  { name: 'Supabase Postgres', uptime: '99.94%', latency: '38ms', status: 'healthy' as const },
  { name: 'Supabase Realtime', uptime: '99.91%', latency: '— (WS)', status: 'healthy' as const },
  { name: 'Upstash Redis', uptime: '99.99%', latency: '12ms', status: 'healthy' as const },
  { name: 'Zalo OA', uptime: '99.85%', latency: '210ms', status: 'healthy' as const },
  { name: 'VNPay Sandbox', uptime: '99.41%', latency: '480ms', status: 'degraded' as const },
  { name: 'Resend Email', uptime: '99.98%', latency: '320ms', status: 'healthy' as const },
];

const RECENT_INCIDENTS = [
  { date: '2026-05-14 09:22', title: 'VNPay sandbox webhook chậm 30 phút', resolved: true },
  { date: '2026-05-10 18:45', title: 'Sentry quota gần hết (Free tier)', resolved: true },
  { date: '2026-05-02 03:12', title: 'Cron reminder T-24h fail 12 lần', resolved: true },
];

export default function AdminHealthPage() {
  return (
    <AdminShell active="health">
      <h1 className="text-2xl font-bold mb-1">Sức khoẻ hệ thống</h1>
      <p className="text-sm text-slate-500 mb-6">Status mọi dependency. Refresh mỗi 30 giây.</p>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold">Dịch vụ</h2>
          <span className="text-xs text-emerald-600">● Mọi hệ thống chạy</span>
        </div>
        <ul className="divide-y divide-slate-100">
          {SERVICES.map((s) => (
            <li key={s.name} className="px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${s.status === 'healthy' ? 'bg-emerald-500' : s.status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                <span className="font-medium">{s.name}</span>
              </div>
              <div className="flex items-center gap-6 text-xs text-slate-500">
                <span>Uptime: <strong className="text-slate-700">{s.uptime}</strong></span>
                <span>Latency: <strong className="text-slate-700 font-mono">{s.latency}</strong></span>
                {s.status === 'healthy' && <span className="text-emerald-600">Healthy</span>}
                {s.status === 'degraded' && <span className="text-amber-600">Degraded</span>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold">Incident gần đây</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {RECENT_INCIDENTS.map((inc, i) => (
            <li key={i} className="px-6 py-3 flex items-start justify-between">
              <div>
                <div className="text-sm font-medium">{inc.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{inc.date}</div>
              </div>
              {inc.resolved && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Resolved</span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </AdminShell>
  );
}
