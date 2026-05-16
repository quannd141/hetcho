import Link from 'next/link';
import { TenantShell } from '../../_components/tenant-shell';
import { EmptyState } from '../../_components/empty-state';
import { listServices, listStaff } from '@/lib/queries';
import { walkInBookingAction } from '@/lib/actions/booking.actions';

interface PageProps {
  params: { slug: string };
  searchParams: { error?: string };
}

function defaultStartAt(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30 - (now.getMinutes() % 30));
  now.setSeconds(0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export default async function WalkInPage({ params, searchParams }: PageProps) {
  const [services, staffList] = await Promise.all([
    listServices(params.slug),
    listStaff(params.slug),
  ]);

  if (services.length === 0 || staffList.length === 0) {
    return (
      <TenantShell slug={params.slug} active="dashboard">
        <Link href={`/${params.slug}/dashboard`} className="text-sm text-slate-500 hover:underline">← Quay về Lịch</Link>
        <h1 className="text-2xl font-bold mt-2 mb-6">Thêm khách walk-in</h1>
        <EmptyState
          icon="⚙️"
          title="Cần setup dịch vụ + thợ trước"
          description="Khách walk-in cần được gán với 1 dịch vụ + 1 thợ. Hoàn tất setup tiệm trước nhé."
          primaryAction={{
            label: services.length === 0 ? '+ Thêm dịch vụ' : '+ Thêm thợ',
            href: services.length === 0 ? `/${params.slug}/services/new` : `/${params.slug}/staff/new`,
          }}
        />
      </TenantShell>
    );
  }

  return (
    <TenantShell slug={params.slug} active="dashboard">
      <Link href={`/${params.slug}/dashboard`} className="text-sm text-slate-500 hover:underline">← Quay về Lịch</Link>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mt-2 mb-2">Thêm khách walk-in</h1>
        <p className="text-sm text-slate-500 mb-6">
          Khách đến trực tiếp (không qua Mini App). Hệ thống sẽ tự lưu vào danh sách khách hàng.
        </p>

        {searchParams.error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-md text-sm text-rose-700">
            ⚠️ {searchParams.error}
          </div>
        )}

        <form action={walkInBookingAction} className="space-y-4 bg-white border border-slate-200 rounded-xl p-6">
          <input type="hidden" name="slug" value={params.slug} />

          <label className="block">
            <span className="text-sm font-medium">Tên khách *</span>
            <input
              required
              name="customerName"
              placeholder="VD: Chị Hoa"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Số điện thoại *</span>
            <input
              required
              name="phone"
              pattern="0\d{9}"
              placeholder="0901234567"
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-500">10 chữ số, bắt đầu bằng 0. Lưu hashed để bảo vệ quyền riêng tư.</p>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium">Dịch vụ *</span>
              <select
                required
                name="serviceId"
                defaultValue={services[0].id}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.durationMinutes}p)</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Thợ / KTV *</span>
              <select
                required
                name="staffId"
                defaultValue={staffList[0].id}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              >
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Bắt đầu lúc *</span>
            <input
              required
              type="datetime-local"
              name="startAt"
              defaultValue={defaultStartAt()}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            />
          </label>

          <div className="flex gap-3 pt-2">
            <Link
              href={`/${params.slug}/dashboard`}
              className="rounded-md border border-slate-300 px-4 py-3 text-sm font-medium hover:bg-slate-50"
            >
              Huỷ
            </Link>
            <button
              type="submit"
              className="flex-1 rounded-md bg-brand-600 px-4 py-3 font-medium text-white hover:bg-brand-700"
            >
              Tạo booking
            </button>
          </div>
        </form>
      </div>
    </TenantShell>
  );
}
