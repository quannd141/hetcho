import Link from 'next/link';
import { TenantShell } from '../../_components/tenant-shell';

interface PageProps { params: { slug: string } }

const TEMPLATES = [
  {
    id: 'tpl-1',
    name: 'Xác nhận booking',
    trigger: 'Khi khách đặt thành công',
    channel: 'ZNS',
    status: 'active',
    body: 'Chào {customer_name}! Tiệm {tenant_name} xác nhận booking {service_name} với {staff_name} lúc {start_at}. Hẹn gặp bạn!',
  },
  {
    id: 'tpl-2',
    name: 'Nhắc T-24h',
    trigger: '24 giờ trước giờ hẹn',
    channel: 'ZNS',
    status: 'active',
    body: '{customer_name} ơi, ngày mai {start_at} bạn có hẹn {service_name} tại {tenant_name}. Nếu cần đổi, bấm vào đây.',
  },
  {
    id: 'tpl-3',
    name: 'Nhắc T-2h',
    trigger: '2 giờ trước giờ hẹn',
    channel: 'ZNS',
    status: 'active',
    body: 'Còn 2 tiếng nữa! Booking {service_name} của bạn tại {tenant_name} bắt đầu lúc {start_at}. Địa chỉ: {tenant_address}',
  },
  {
    id: 'tpl-4',
    name: 'Cảm ơn sau hoàn tất',
    trigger: 'Khi booking completed',
    channel: 'ZNS',
    status: 'active',
    body: 'Cảm ơn {customer_name} đã đến {tenant_name}! Đánh giá cho {staff_name} tại đây để giúp tiệm phát triển.',
  },
  {
    id: 'tpl-5',
    name: 'Nhắc hết hạn gói liệu trình',
    trigger: '7 ngày trước hết hạn gói',
    channel: 'ZNS',
    status: 'active',
    body: 'Gói {package_name} của bạn còn {remaining_sessions} buổi, hết hạn ngày {expire_date}. Đặt lịch ngay!',
  },
];

export default function TemplatesPage({ params }: PageProps) {
  return (
    <TenantShell slug={params.slug} active="marketing">
      <Link href={`/${params.slug}/marketing`} className="text-sm text-slate-500 hover:underline">← Marketing & nhắc khách</Link>
      <div className="flex items-center justify-between mt-2 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Template tin nhắn ({TEMPLATES.length})</h1>
          <p className="text-sm text-slate-500 mt-1">Soạn nội dung gửi tự động qua Zalo Notification Service (ZNS).</p>
        </div>
      </div>

      <div className="space-y-4">
        {TEMPLATES.map((t) => (
          <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Trigger: {t.trigger} · Kênh: {t.channel}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded">Đang dùng</span>
                <button className="text-brand-600 text-xs hover:underline">Sửa</button>
              </div>
            </div>

            <textarea
              rows={3}
              defaultValue={t.body}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-mono bg-slate-50"
            />
            <p className="text-xs text-slate-500 mt-2">
              Biến: <code className="bg-slate-100 px-1 rounded">{'{customer_name}'}</code>{' '}
              <code className="bg-slate-100 px-1 rounded">{'{tenant_name}'}</code>{' '}
              <code className="bg-slate-100 px-1 rounded">{'{service_name}'}</code>{' '}
              <code className="bg-slate-100 px-1 rounded">{'{staff_name}'}</code>{' '}
              <code className="bg-slate-100 px-1 rounded">{'{start_at}'}</code>
            </p>
          </div>
        ))}

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
          <p className="font-semibold text-amber-900">⚠️ Lưu ý ZNS template</p>
          <p className="text-amber-800 mt-1">
            Mỗi template phải được Zalo Business duyệt trước khi gửi thật. Trong NIGHT_SHIFT_MODE, hệ thống log message ra file thay vì gửi.
          </p>
        </div>
      </div>
    </TenantShell>
  );
}
