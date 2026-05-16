import Link from 'next/link';
import { TenantShell } from '../../_components/tenant-shell';

const EVENT_MATRIX: Array<{
  key: string;
  label: string;
  description: string;
  channels: { zalo: boolean; sms: boolean; email: boolean; push: boolean };
}> = [
  { key: 'booking_created', label: 'Có booking mới', description: 'Khách đặt qua Mini App hoặc web', channels: { zalo: true, sms: false, email: true, push: true } },
  { key: 'booking_confirmed', label: 'Khách đã đặt cọc', description: 'Sau khi VNPay callback success', channels: { zalo: true, sms: false, email: false, push: true } },
  { key: 'booking_cancelled', label: 'Khách huỷ booking', description: 'Có thể đã trong hoặc ngoài giờ phạt', channels: { zalo: true, sms: true, email: true, push: true } },
  { key: 'booking_no_show', label: 'Khách bỏ hẹn', description: 'Sau giờ hẹn 15 phút khách chưa đến', channels: { zalo: true, sms: false, email: false, push: true } },
  { key: 'reminder_24h', label: 'Nhắc T-24h', description: 'Gửi cho khách 24 giờ trước hẹn', channels: { zalo: true, sms: false, email: false, push: false } },
  { key: 'reminder_2h', label: 'Nhắc T-2h', description: 'Gửi cho khách 2 giờ trước hẹn', channels: { zalo: true, sms: true, email: false, push: false } },
  { key: 'recovery_30', label: 'Recovery 30 ngày', description: 'Khách không quay lại sau 30 ngày + voucher 10%', channels: { zalo: true, sms: false, email: false, push: false } },
  { key: 'recovery_60', label: 'Recovery 60 ngày', description: 'Voucher 20%', channels: { zalo: true, sms: false, email: false, push: false } },
  { key: 'recovery_90', label: 'Recovery 90 ngày', description: 'Last call + voucher 30%', channels: { zalo: true, sms: false, email: false, push: false } },
  { key: 'low_inventory', label: 'Cảnh báo tồn kho', description: 'Sản phẩm spa dùng cho liệu trình sắp hết', channels: { zalo: false, sms: false, email: true, push: true } },
  { key: 'review_received', label: 'Khách đánh giá', description: 'Khi khách bấm sao + comment sau buổi làm', channels: { zalo: false, sms: false, email: true, push: true } },
];

export default function NotificationSettingsPage({ params }: { params: { slug: string } }) {
  return (
    <TenantShell slug={params.slug} active="settings">
      <div className="mb-6 flex items-center gap-3 text-sm">
        <Link href={`/${params.slug}/settings`} className="text-slate-500 hover:text-slate-700">
          ← Cấu hình
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-medium">Thông báo</span>
      </div>

      <div className="space-y-6 max-w-4xl">
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-bold">Kênh chính</h2>
            <p className="text-sm text-slate-500 mt-1">Bật / tắt theo channel. Áp dụng cho mọi sự kiện bên dưới.</p>
          </div>
          <div className="p-6 space-y-4">
            <ChannelRow icon="💬" name="Zalo OA" status="Đã kết nối" detail="OA: Salon Hằng — verified" defaultOn />
            <ChannelRow icon="📱" name="ZNS (Zalo Notification Service)" status="Đã đăng ký 5 template" detail="Phí ~200đ/tin transactional" defaultOn />
            <ChannelRow icon="📧" name="Email (Resend)" status="Đã verify domain" detail="noreply@salon-hang.hetcho.vn" defaultOn />
            <ChannelRow icon="📨" name="SMS (Viettel/Vinaphone)" status="Chưa kết nối" detail="Cần đăng ký brand name, phí ~600đ/tin" defaultOn={false} />
            <ChannelRow icon="🔔" name="Push web (chủ tiệm)" status="Hoạt động" detail="Browser notification cho dashboard" defaultOn />
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-bold">Giờ yên tĩnh (Do Not Disturb)</h2>
            <p className="text-sm text-slate-500 mt-1">Không gửi thông báo cho khách trong khung giờ này (vẫn gửi cho chủ tiệm).</p>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4 max-w-md">
            <label className="block">
              <span className="text-sm font-medium">Bắt đầu</span>
              <input type="time" defaultValue="22:00" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Kết thúc</span>
              <input type="time" defaultValue="07:00" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-bold">Theo sự kiện</h2>
            <p className="text-sm text-slate-500 mt-1">
              Tick channel nào sẽ nhận thông báo cho từng loại sự kiện.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Sự kiện</th>
                  <th className="px-3 py-3 font-medium">Zalo</th>
                  <th className="px-3 py-3 font-medium">SMS</th>
                  <th className="px-3 py-3 font-medium">Email</th>
                  <th className="px-3 py-3 font-medium">Push</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {EVENT_MATRIX.map((evt) => (
                  <tr key={evt.key}>
                    <td className="px-6 py-3">
                      <div className="font-medium">{evt.label}</div>
                      <div className="text-xs text-slate-500">{evt.description}</div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <input type="checkbox" defaultChecked={evt.channels.zalo} className="h-4 w-4" />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <input type="checkbox" defaultChecked={evt.channels.sms} className="h-4 w-4" />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <input type="checkbox" defaultChecked={evt.channels.email} className="h-4 w-4" />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <input type="checkbox" defaultChecked={evt.channels.push} className="h-4 w-4" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex justify-end gap-3 pb-8">
          <Link
            href={`/${params.slug}/settings`}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
          >
            Huỷ
          </Link>
          <button className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
            Lưu cấu hình
          </button>
        </div>
      </div>
    </TenantShell>
  );
}

function ChannelRow({
  icon,
  name,
  status,
  detail,
  defaultOn,
}: {
  icon: string;
  name: string;
  status: string;
  detail: string;
  defaultOn: boolean;
}) {
  return (
    <div className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg">
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{name}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{status}</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">{detail}</div>
      </div>
      <label className="inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked={defaultOn} className="sr-only peer" />
        <div className="relative w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-brand-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-transform peer-checked:after:translate-x-5" />
      </label>
    </div>
  );
}
