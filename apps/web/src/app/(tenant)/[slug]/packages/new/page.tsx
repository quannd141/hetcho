import Link from 'next/link';
import { TenantShell } from '../../_components/tenant-shell';
import { demoServices } from '../../_lib/demo-catalog';

interface PageProps { params: { slug: string } }

export default function NewPackagePage({ params }: PageProps) {
  const services = demoServices(params.slug);
  return (
    <TenantShell slug={params.slug} active="packages">
      <div className="max-w-2xl">
        <Link href={`/${params.slug}/packages`} className="text-sm text-slate-500 hover:underline">← Quay về Gói liệu trình</Link>
        <h1 className="text-2xl font-bold mt-2 mb-6">Tạo gói liệu trình mới</h1>

        <form action={`/${params.slug}/packages`} method="get" className="space-y-4 bg-white border border-slate-200 rounded-xl p-6">
          <label className="block">
            <span className="text-sm font-medium">Tên gói *</span>
            <input required name="name" placeholder="VD: Trắng da chuyên sâu 10 buổi"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Dịch vụ áp dụng *</span>
            <select required name="serviceId" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">— Chọn dịch vụ —</option>
              {services.map((sv) => (
                <option key={sv.id} value={sv.id}>{sv.name}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Số buổi *</span>
              <input required type="number" name="totalSessions" defaultValue={10} min={2} max={50}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Hiệu lực (ngày) *</span>
              <input required type="number" name="validDays" defaultValue={90} min={7} max={365}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Giá gói (VND) *</span>
            <input required type="number" name="priceVnd" defaultValue={6500000} step={100000} min={0}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <p className="mt-1 text-xs text-slate-500">So với mua lẻ 10 buổi: 8.000.000 ₫ → tiết kiệm cho khách 19%</p>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Mô tả gói (cho khách thấy trên Mini App)</span>
            <textarea name="description" rows={3} placeholder="VD: Liệu trình 10 buổi trắng da chuyên sâu, sử dụng công nghệ Hydra Facial..."
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Nhắc khách trước khi hết hạn (ngày)</span>
            <input type="number" name="reminderBeforeExpire" defaultValue={7} min={1} max={30}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <p className="mt-1 text-xs text-slate-500">Hệ thống tự gửi ZNS nhắc khách dùng nốt gói trước khi hết.</p>
          </label>

          <div className="flex gap-3 pt-2">
            <Link href={`/${params.slug}/packages`} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">Huỷ</Link>
            <button type="submit" className="flex-1 rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
              Tạo gói
            </button>
          </div>
        </form>
      </div>
    </TenantShell>
  );
}
