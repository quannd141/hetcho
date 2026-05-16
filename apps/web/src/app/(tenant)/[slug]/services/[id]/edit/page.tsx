import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TenantShell } from '../../../_components/tenant-shell';
import { ConfirmDialog } from '../../../_components/confirm-dialog';
import { demoServices } from '../../../_lib/demo-catalog';

interface PageProps { params: { slug: string; id: string } }

export default function EditServicePage({ params }: PageProps) {
  const service = demoServices(params.slug).find((s) => s.id === params.id);
  if (!service) notFound();

  return (
    <TenantShell slug={params.slug} active="services">
      <div className="max-w-2xl">
        <Link href={`/${params.slug}/services`} className="text-sm text-slate-500 hover:underline">← Quay về Dịch vụ</Link>
        <h1 className="text-2xl font-bold mt-2 mb-6">Sửa: {service.name}</h1>

        <form action={`/${params.slug}/services`} method="get" className="space-y-4 bg-white border border-slate-200 rounded-xl p-6">
          <label className="block">
            <span className="text-sm font-medium">Tên dịch vụ *</span>
            <input required name="name" defaultValue={service.name}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Danh mục</span>
              <input name="category" defaultValue={service.category}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Thời lượng (phút)</span>
              <input type="number" name="duration" defaultValue={service.durationMinutes} step={15} min={15}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Giá (VND)</span>
            <input required type="number" name="priceVnd" defaultValue={service.priceVnd} step={10000} min={0}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <fieldset className="border border-slate-200 rounded-lg p-4">
            <legend className="text-sm font-semibold px-2">Cọc giữ chỗ</legend>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Giờ thường</span>
                <input type="number" name="depositNormal" defaultValue={service.depositNormalVnd} step={10000} min={0}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Giờ cao điểm</span>
                <input type="number" name="depositPeak" defaultValue={service.depositPeakVnd} step={10000} min={0}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </label>
            </div>
          </fieldset>

          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked={service.isActive} />
            <span className="text-sm">Đang bán (khách thấy trên Mini App)</span>
          </label>

          <div className="flex gap-3 pt-2">
            <ConfirmDialog
              variant="danger"
              title={`Xoá dịch vụ "${service.name}"?`}
              description="Khách hàng sẽ không đặt được dịch vụ này nữa. Booking trong quá khứ vẫn được giữ. Hành động không hoàn tác được."
              confirmLabel="Xoá vĩnh viễn"
              requireTypeToConfirm="XOA"
              trigger={
                <button type="button" className="rounded-md border border-rose-300 text-rose-600 px-4 py-2 text-sm font-medium hover:bg-rose-50">
                  Xoá
                </button>
              }
            />
            <Link href={`/${params.slug}/services`} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">Huỷ</Link>
            <button type="submit" className="flex-1 rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </TenantShell>
  );
}
