import Link from 'next/link';
import { TenantShell } from '../_components/tenant-shell';
import { EmptyState } from '../_components/empty-state';
import { listStaff, listServices } from '@/lib/queries';

interface PageProps {
  params: { slug: string };
  searchParams: { created?: string };
}

export default async function StaffPage({ params, searchParams }: PageProps) {
  const [staffList, services] = await Promise.all([
    listStaff(params.slug),
    listServices(params.slug),
  ]);

  return (
    <TenantShell slug={params.slug} active="staff">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Thợ / KTV ({staffList.length})</h1>
          <p className="text-sm text-slate-500 mt-1">Mỗi người có giờ làm + danh sách dịch vụ làm được riêng.</p>
        </div>
        <Link href={`/${params.slug}/staff/new`} className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
          + Thêm người
        </Link>
      </div>

      {searchParams.created === '1' && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-sm text-emerald-800">
          ✅ Đã thêm thợ mới.
        </div>
      )}

      {staffList.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Chưa có thợ / KTV"
          description="Thêm ít nhất 1 người để có thể nhận booking. Mỗi người có giờ làm + dịch vụ làm được riêng."
          primaryAction={{ label: '+ Thêm thợ đầu tiên', href: `/${params.slug}/staff/new` }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staffList.map((s) => {
            const serviceNames = s.serviceIds
              .map((id) => services.find((sv) => sv.id === id)?.name)
              .filter(Boolean);
            const workingHoursLabel = formatHoursLabel(s.workingHours);
            return (
              <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center text-2xl">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-slate-500">Thợ / KTV</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Giờ làm việc</p>
                    <p className="text-sm font-mono">{workingHoursLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Dịch vụ ({serviceNames.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {serviceNames.length > 0 ? (
                        serviceNames.map((n) => (
                          <span key={n} className="text-xs px-2 py-0.5 bg-slate-100 rounded">{n}</span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">Chưa gán dịch vụ</span>
                      )}
                    </div>
                  </div>
                </div>
                {!s.isActive && (
                  <div className="mt-4 text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded inline-block">Tạm nghỉ</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </TenantShell>
  );
}

function formatHoursLabel(wh: Record<string, { open: string; close: string } | null>): string {
  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const opens = days.filter((d) => wh[d]).length;
  if (opens === 7) {
    const sample = wh.mon!;
    return `T2-CN ${sample.open}-${sample.close}`;
  }
  if (opens === 0) return 'Nghỉ';
  return `${opens} ngày/tuần`;
}
