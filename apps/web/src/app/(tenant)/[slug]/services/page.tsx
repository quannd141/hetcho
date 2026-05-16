import Link from 'next/link';
import { TenantShell } from '../_components/tenant-shell';
import { EmptyState } from '../_components/empty-state';
import { listServices } from '@/lib/queries';

interface PageProps {
  params: { slug: string };
  searchParams: { empty?: string; created?: string };
}

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export default async function ServicesPage({ params, searchParams }: PageProps) {
  const services = searchParams.empty === '1' ? [] : await listServices(params.slug);
  return (
    <TenantShell slug={params.slug} active="services">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý dịch vụ ({services.length})</h1>
          <p className="text-sm text-slate-500 mt-1">Cấu hình dịch vụ + giá + cọc — khách sẽ thấy danh sách này khi đặt qua Mini App.</p>
        </div>
        <Link href={`/${params.slug}/services/new`} className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
          + Thêm dịch vụ
        </Link>
      </div>

      {searchParams.created === '1' && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md text-sm text-emerald-800">
          ✅ Đã thêm dịch vụ mới.
        </div>
      )}

      {services.length === 0 ? (
        <EmptyState
          icon="✂️"
          title="Chưa có dịch vụ nào"
          description="Thêm dịch vụ đầu tiên để khách thấy khi đặt qua Mini App. Bắt đầu với 2-3 dịch vụ phổ biến nhất của tiệm."
          primaryAction={{ label: '+ Thêm dịch vụ đầu tiên', href: `/${params.slug}/services/new` }}
          secondaryAction={{ label: 'Xem mẫu tham khảo', href: `/${params.slug}/services` }}
          hint="Mẹo: dùng template salon tóc / spa / nail có sẵn để rút ngắn 80% thời gian."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Tên dịch vụ</th>
                <th className="px-4 py-3 font-semibold">Danh mục</th>
                <th className="px-4 py-3 font-semibold">Thời lượng</th>
                <th className="px-4 py-3 font-semibold">Giá</th>
                <th className="px-4 py-3 font-semibold">Cọc thường</th>
                <th className="px-4 py-3 font-semibold">Cọc cao điểm</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-slate-500">{s.category ?? '—'}</td>
                  <td className="px-4 py-3">{s.durationMinutes} phút</td>
                  <td className="px-4 py-3 font-mono">{fmtVnd(s.priceVnd)}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{s.depositNormalVnd === 0 ? '—' : fmtVnd(s.depositNormalVnd)}</td>
                  <td className="px-4 py-3 font-mono text-orange-700">{s.depositPeakVnd === 0 ? '—' : fmtVnd(s.depositPeakVnd)}</td>
                  <td className="px-4 py-3">
                    {s.isActive ? (
                      <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded">Đang bán</span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded">Tạm tắt</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/${params.slug}/services/${s.id}/edit`} className="text-brand-600 hover:underline text-xs">Sửa</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </TenantShell>
  );
}
