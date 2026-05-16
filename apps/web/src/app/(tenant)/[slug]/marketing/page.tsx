import Link from 'next/link';
import { TenantShell } from '../_components/tenant-shell';

interface PageProps { params: { slug: string } }

export default function MarketingHubPage({ params }: PageProps) {
  return (
    <TenantShell slug={params.slug} active="marketing">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Marketing & nhắc khách</h1>
        <p className="text-sm text-slate-500 mt-1">F5 — Auto Zalo reminder + Recovery campaign khi khách lâu không đến.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href={`/${params.slug}/marketing/templates`} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-brand-300 hover:shadow-md transition">
          <div className="text-3xl mb-2">📨</div>
          <h2 className="font-semibold text-lg">Template tin nhắn</h2>
          <p className="text-sm text-slate-500 mt-1">Soạn nội dung ZNS: xác nhận, nhắc T-24h, nhắc T-2h, sinh nhật…</p>
          <p className="text-xs text-emerald-600 mt-3 font-medium">5 template đang dùng</p>
        </Link>

        <Link href={`/${params.slug}/marketing/recovery`} className="bg-white border border-slate-200 rounded-xl p-6 hover:border-brand-300 hover:shadow-md transition">
          <div className="text-3xl mb-2">🔁</div>
          <h2 className="font-semibold text-lg">Recovery campaign</h2>
          <p className="text-sm text-slate-500 mt-1">Tự động nhắc khách lâu không đến: 30/60/90 ngày, gửi qua Zalo OA broadcast.</p>
          <p className="text-xs text-emerald-600 mt-3 font-medium">23 khách đang trong recovery</p>
        </Link>

        <div className="bg-white border border-slate-200 rounded-xl p-6 opacity-60">
          <div className="text-3xl mb-2">🎂</div>
          <h2 className="font-semibold text-lg">Sinh nhật khách</h2>
          <p className="text-sm text-slate-500 mt-1">Tự động gửi voucher khi sinh nhật khách. (Phase 2)</p>
          <p className="text-xs text-slate-400 mt-3">Sau M3</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 opacity-60">
          <div className="text-3xl mb-2">📢</div>
          <h2 className="font-semibold text-lg">Broadcast khuyến mãi</h2>
          <p className="text-sm text-slate-500 mt-1">Gửi tin khuyến mãi cho toàn bộ khách qua OA. (Phase 2)</p>
          <p className="text-xs text-slate-400 mt-3">Sau M3</p>
        </div>
      </div>
    </TenantShell>
  );
}
