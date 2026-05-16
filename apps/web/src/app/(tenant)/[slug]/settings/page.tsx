import { TenantShell } from '../_components/tenant-shell';

const DAYS = [
  { key: 'mon', label: 'Thứ 2' },
  { key: 'tue', label: 'Thứ 3' },
  { key: 'wed', label: 'Thứ 4' },
  { key: 'thu', label: 'Thứ 5' },
  { key: 'fri', label: 'Thứ 6' },
  { key: 'sat', label: 'Thứ 7' },
  { key: 'sun', label: 'Chủ nhật' },
];

interface PageProps { params: { slug: string } }

export default function SettingsPage({ params }: PageProps) {
  return (
    <TenantShell slug={params.slug} active="settings">
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Cấu hình tiệm</h1>
          <p className="text-sm text-slate-500 mt-1">Mọi cấu hình áp dụng theo từng tiệm — không ảnh hưởng tiệm khác.</p>
        </div>

        <Section title="Thông tin tiệm" subtitle="Tên hiển thị, loại tiệm, địa chỉ">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tên tiệm" defaultValue="Salon Hằng Hair" />
            <Field label="Slug URL" defaultValue={params.slug} />
            <Field label="Loại tiệm" as="select" options={['Salon tóc', 'Spa / Skincare', 'Nail', 'Barber', 'Gội đầu', 'Massage']} />
            <Field label="Thành phố" as="select" options={['Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Khác']} />
          </div>
          <Field label="Địa chỉ" defaultValue="123 Đường ABC, Quận 1" />
        </Section>

        <Section title="Giờ làm việc" subtitle="Khách chỉ thấy slot trong khung này">
          <div className="space-y-2">
            {DAYS.map((d) => (
              <div key={d.key} className="flex items-center gap-3">
                <label className="flex items-center gap-2 w-28">
                  <input type="checkbox" defaultChecked />
                  <span className="font-medium text-sm">{d.label}</span>
                </label>
                <input type="time" defaultValue="08:00" className="rounded-md border border-slate-300 px-2 py-1 text-sm" />
                <span className="text-slate-400">→</span>
                <input type="time" defaultValue="22:00" className="rounded-md border border-slate-300 px-2 py-1 text-sm" />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Khung cao điểm" subtitle="Áp dụng cọc cao điểm thay vì cọc thường">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between border border-slate-200 rounded-md px-3 py-2">
              <span>Thứ 7, 14:00 — 22:00</span>
              <button className="text-rose-600 hover:underline text-xs">Xoá</button>
            </div>
            <div className="flex items-center justify-between border border-slate-200 rounded-md px-3 py-2">
              <span>Chủ nhật, 10:00 — 22:00</span>
              <button className="text-rose-600 hover:underline text-xs">Xoá</button>
            </div>
            <button className="text-brand-600 hover:underline text-sm">+ Thêm khung cao điểm</button>
          </div>
        </Section>

        <Section title="Cọc giữ chỗ (F6)" subtitle="Chống khách giữ chỗ rồi bỏ — cọc mặc định áp dụng cho mọi dịch vụ (override per service ở trang Dịch vụ)">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cọc giờ thường (VND)" type="number" defaultValue="0" />
            <Field label="Cọc giờ cao điểm (VND)" type="number" defaultValue="50000" />
            <Field label="Thời gian giữ slot khi chưa trả cọc (phút)" type="number" defaultValue="5" />
            <Field label="Thời gian quá hạn → no-show (phút sau giờ hẹn)" type="number" defaultValue="30" />
          </div>
        </Section>

        <Section title="Chính sách huỷ" subtitle="Quyết định khách được hoàn cọc bao nhiêu khi huỷ">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Huỷ trước (giờ) → hoàn 100%" type="number" defaultValue="24" />
            <Field label="Huỷ trễ → phí phạt (%)" type="number" defaultValue="50" />
          </div>
          <p className="text-xs text-slate-500">Ví dụ: 24h / 50% → khách huỷ trước 24h được hoàn full, sau đó chỉ hoàn 50%.</p>
        </Section>

        <Section title="Zalo OA + Mini App" subtitle="Kết nối kênh khách đặt qua Zalo">
          <Field label="Zalo OA ID" defaultValue="1234567890" />
          <Field label="Zalo Mini App ID" defaultValue="2882233557555444" />
          <Field label="ZNS Template ID — nhắc T-24h" defaultValue="123456" />
          <Field label="ZNS Template ID — nhắc T-2h" defaultValue="123457" />
          <p className="text-xs text-slate-500">Đăng ký template tại business.zalo.me. Chưa có thì để trống.</p>
        </Section>

        <Section title="Thanh toán" subtitle="Cấu hình gateway nhận cọc">
          <div className="space-y-3">
            <label className="flex items-center gap-3 border border-slate-200 rounded-md px-3 py-3">
              <input type="checkbox" defaultChecked />
              <span className="flex-1">
                <span className="font-medium">VNPay</span>
                <span className="block text-xs text-slate-500">QR + thẻ ATM nội địa</span>
              </span>
              <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded">Mặc định</span>
            </label>
            <label className="flex items-center gap-3 border border-slate-200 rounded-md px-3 py-3">
              <input type="checkbox" />
              <span className="flex-1">
                <span className="font-medium">MoMo</span>
                <span className="block text-xs text-slate-500">Sprint 4+ (sau Closed Beta)</span>
              </span>
            </label>
            <label className="flex items-center gap-3 border border-slate-200 rounded-md px-3 py-3">
              <input type="checkbox" />
              <span className="flex-1">
                <span className="font-medium">ZaloPay</span>
                <span className="block text-xs text-slate-500">Sprint 4+</span>
              </span>
            </label>
          </div>
        </Section>

        <Section title="Google Calendar sync" subtitle="Đồng bộ booking 2 chiều — khách đặt = block luôn ở GCal cá nhân">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Trạng thái: <span className="text-slate-500">Chưa kết nối</span></p>
              <p className="text-xs text-slate-500 mt-1">Khi kết nối, mọi booking sẽ tự push lên GCal của bạn.</p>
            </div>
            <button className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800">Kết nối Google</button>
          </div>
        </Section>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-slate-50 -mx-6 px-6 py-4">
          <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-white">Huỷ</button>
          <button className="rounded-md bg-brand-600 text-white px-6 py-2 text-sm font-medium hover:bg-brand-700">Lưu cấu hình</button>
        </div>
      </div>
    </TenantShell>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  defaultValue,
  type = 'text',
  as,
  options,
}: {
  label: string;
  defaultValue?: string;
  type?: string;
  as?: 'select';
  options?: string[];
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {as === 'select' ? (
        <select className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
          {options?.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          defaultValue={defaultValue}
          className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      )}
    </label>
  );
}
