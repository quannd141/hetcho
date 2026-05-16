import Link from 'next/link';
import { TenantShell } from '../../_components/tenant-shell';
import { demoServices } from '../../_lib/demo-catalog';

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

interface PageProps { params: { slug: string } }

export default function NewStaffPage({ params }: PageProps) {
  const services = demoServices(params.slug);
  return (
    <TenantShell slug={params.slug} active="staff">
      <div className="max-w-2xl">
        <Link href={`/${params.slug}/staff`} className="text-sm text-slate-500 hover:underline">← Quay về Thợ / KTV</Link>
        <h1 className="text-2xl font-bold mt-2 mb-6">Thêm thợ / KTV mới</h1>

        <form action={`/${params.slug}/staff`} method="get" className="space-y-4 bg-white border border-slate-200 rounded-xl p-6">
          <label className="block">
            <span className="text-sm font-medium">Tên *</span>
            <input required name="name" placeholder="VD: Stylist Tú"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Vai trò</span>
            <select name="role" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option>Stylist</option>
              <option>KTV</option>
              <option>Thợ</option>
              <option>Chủ tiệm</option>
              <option>Master</option>
            </select>
          </label>

          <fieldset className="border border-slate-200 rounded-lg p-4">
            <legend className="text-sm font-semibold px-2">Dịch vụ làm được *</legend>
            <div className="space-y-2">
              {services.map((sv) => (
                <label key={sv.id} className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">{sv.name} <span className="text-xs text-slate-500">({sv.durationMinutes}m)</span></span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="border border-slate-200 rounded-lg p-4">
            <legend className="text-sm font-semibold px-2">Giờ làm việc</legend>
            <div className="space-y-2">
              {DAYS.map((d) => (
                <div key={d} className="flex items-center gap-3">
                  <label className="flex items-center gap-2 w-16">
                    <input type="checkbox" defaultChecked />
                    <span className="font-medium text-sm">{d}</span>
                  </label>
                  <input type="time" defaultValue="09:00" className="rounded-md border border-slate-300 px-2 py-1 text-sm" />
                  <span className="text-slate-400">→</span>
                  <input type="time" defaultValue="21:00" className="rounded-md border border-slate-300 px-2 py-1 text-sm" />
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
