import Link from 'next/link';
import { TenantShell } from '../../_components/tenant-shell';

interface PageProps { params: { slug: string } }

const STAGES = [
  {
    days: 30,
    label: '30 ngày không đến',
    color: 'blue',
    discount: 10,
    voucher: 'VOUCHER-30D',
    countTargeted: 12,
    countResponded: 5,
    countReBooked: 3,
    bodyDraft: 'Lâu không gặp {customer_name}! Tặng bạn voucher giảm 10% cho lần tiếp theo. Đặt lại tại {tenant_name}.',
  },
  {
    days: 60,
    label: '60 ngày không đến',
    color: 'amber',
    discount: 20,
    voucher: 'VOUCHER-60D',
    countTargeted: 8,
    countResponded: 3,
    countReBooked: 1,
    bodyDraft: '{customer_name} ơi, đã 2 tháng rồi! Nhận voucher 20% — chỉ áp dụng cho khách thân thiết như bạn.',
  },
  {
    days: 90,
    label: '90 ngày không đến (last call)',
    color: 'rose',
    discount: 30,
    voucher: 'VOUCHER-90D',
    countTargeted: 3,
    countResponded: 1,
    countReBooked: 0,
    bodyDraft: '🎁 Voucher đặc biệt: giảm 30% cho {customer_name}. Tiệm vẫn nhớ bạn! Mã hết hạn 7 ngày.',
  },
];

const COLOR_MAP: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200 text-blue-900',
  amber: 'bg-amber-50 border-amber-200 text-amber-900',
  rose: 'bg-rose-50 border-rose-200 text-rose-900',
};

export default function RecoveryPage({ params }: PageProps) {
  const totalTargeted = STAGES.reduce((acc, s) => acc + s.countTargeted, 0);
  const totalResponded = STAGES.reduce((acc, s) => acc + s.countResponded, 0);
  const totalReBooked = STAGES.reduce((acc, s) => acc + s.countReBooked, 0);
  const responseRate = totalTargeted > 0 ? Math.round((totalResponded / totalTargeted) * 100) : 0;
  const reBookRate = totalResponded > 0 ? Math.round((totalReBooked / totalResponded) * 100) : 0;

  return (
    <TenantShell slug={params.slug} active="marketing">
      <Link href={`/${params.slug}/marketing`} className="text-sm text-slate-500 hover:underline">← Marketing & nhắc khách</Link>
      <div className="mt-2 mb-6">
        <h1 className="text-2xl font-bold">Recovery campaign 30/60/90 ngày</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tự động gửi voucher cho khách lâu không đến qua Zalo OA. Khách càng "ngủ" lâu → voucher càng cao.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card label="Đang target" value={String(totalTargeted)} sub="người" />
        <Card label="Đã reply" value={String(totalResponded)} sub={`${responseRate}%`} />
        <Card label="Đã re-book" value={String(totalReBooked)} sub={`${reBookRate}% conv`} />
        <Card label="Doanh thu recovery (30d)" value="6.8M ₫" sub="+12% MoM" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Bật / tắt campaign</h2>
            <p className="text-xs text-slate-500 mt-1">Cron daily 09:00 quét customer + gửi qua OA broadcast.</p>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            <span className="text-sm font-medium">Đang chạy</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {STAGES.map((s) => (
          <div key={s.days} className="bg-white border border-slate-200 rounded-xl p-6">
            <div className={`inline-block px-3 py-1 rounded-md text-sm font-semibold mb-3 ${COLOR_MAP[s.color]}`}>
              📅 {s.label}
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-500">Giảm giá</p>
                <p className="text-2xl font-bold">{s.discount}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Mã voucher</p>
                <p className="text-lg font-mono">{s.voucher}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Hiệu lực</p>
                <p className="text-lg">7 ngày</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Nội dung tin nhắn</p>
              <textarea
                rows={3}
                defaultValue={s.bodyDraft}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-mono bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 text-sm">
              <div>
                <span className="text-slate-500">Đã gửi:</span> <strong>{s.countTargeted}</strong>
              </div>
              <div>
                <span className="text-slate-500">Reply:</span> <strong>{s.countResponded}</strong>
              </div>
              <div>
                <span className="text-emerald-700">Re-book:</span> <strong>{s.countReBooked}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm">
        <p className="font-semibold text-blue-900">💡 Tip từ clientbookings.co.uk</p>
        <p className="text-blue-800 mt-1">
          Voucher 30% ở mốc 90 ngày recover được ~15% khách "ngủ" — ROI cao nhất trong toàn bộ retention funnel.
        </p>
      </div>
    </TenantShell>
  );
}

function Card({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{sub}</div>
    </div>
  );
}
