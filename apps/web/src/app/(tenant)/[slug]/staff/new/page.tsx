import Link from 'next/link';
import { TenantShell } from '../../_components/tenant-shell';
import { EmptyState } from '../../_components/empty-state';
import { listServices } from '@/lib/queries';
import { addStaffAction } from '@/lib/actions/tenant.actions';

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

interface PageProps { params: { slug: string }; searchParams: { error?: string } }

export default async function NewStaffPage({ params, searchParams }: PageProps) {
  const services = await listServices(params.slug);

  if (services.length === 0) {
    return (
      <TenantShell slug={params.slug} active="staff">
        <Link href={`/${params.slug}/staff`} className="text-sm text-slate-500 hover:underline">← Quay về Thợ / KTV</Link>
        <h1 className="text-2xl font-bold mt-2 mb-6">Thêm thợ / KTV mới</h1>
        <EmptyState
          icon="✂️"
          title="Cần có ít nhất 1 dịch vụ trước"
          description="Thợ phải được gán với ít nhất 1 dịch vụ. Tạo dịch vụ đầu tiên trước nhé."
          primaryAction={{ label: '+ Tạo dịch vụ trước', href: `/${params.slug}/services/new` }}
        />
      </TenantShell>
    );
  }

  return (
    <TenantShell slug={params.slug} active="staff">
      <div className="max-w-2xl">
        <Link href={`/${params.slug}/staff`} className="text-sm text-slate-500 hover:underline">← Quay về Thợ / KTV</Link>
        <h1 className="text-2xl font-bold mt-2 mb-6">Thêm thợ / KTV mới</h1>

        {searchParams.error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-md text-sm text-rose-700">
            ⚠️ {searchParams.error}
          </div>
        )}

        <form action={addStaffAction} className="space-y-4 bg-white border border-slate-200 rounded-xl p-6">
          <input type="hidden" name="slug" value={params.slug} />

          <label className="block">
            <span className="text-sm font-medium">Tên *</span>
            <input required name="name" placeholder="VD: Stylist Tú"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <fieldset className="border border-slate-200 rounded-lg p-4">
            <legend className="text-sm font-semibold px-2">Dịch vụ làm được *</legend>
            <div className="space-y-2">
              {services.map((sv, i) => (
                <label key={sv.id} className="flex items-center gap-2">
                  <input type="checkbox" name="serviceIds" value={sv.id} defaultChecked={i === 0} />
                  <span className="text-sm">{sv.name} <span className="text-xs text-slate-500">({sv.durationMinutes}m)</span></span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="border border-slate-200 rounded-lg p-4 opacity-70">
            <legend className="text-sm font-semibold px-2">Giờ làm việc</legend>
            <p className="text-xs text-slate-500 mb-2">Mặc định: T2-CN 08:00-22:00 (có thể chỉnh sau ở Cấu hình).</p>
            <div className="space-y-2">
              {DAYS.map((d) => (
                <div key={d} className="flex items-center gap-3">
                  <span className="font-medium text-sm w-16">{d}</span>
                  <span className="text-sm text-slate-500">08:00 → 22:00</span>
                </div>
              ))}
            </div>
          </fieldset>

          <div className="flex gap-3 pt-2">
            <Link href={`/${params.slug}/staff`} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">Huỷ</Link>
            <button type="submit" className="flex-1 rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
              Lưu thợ / KTV
            </button>
          </div>
        </form>
      </div>
    </TenantShell>
  );
}
