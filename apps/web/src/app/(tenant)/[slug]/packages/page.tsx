import Link from 'next/link';
import { TenantShell } from '../_components/tenant-shell';
import { demoPackages } from '../_lib/demo-catalog';

interface PageProps { params: { slug: string } }

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export default function PackagesPage({ params }: PageProps) {
  const packages = demoPackages(params.slug);
  return (
    <TenantShell slug={params.slug} active="packages">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gói liệu trình (F4)</h1>
          <p className="text-sm text-slate-500 mt-1">Khách mua trọn gói nhiều buổi với giá ưu đãi — phù hợp spa, skincare, massage.</p>
        </div>
        <Link href={`/${params.slug}/packages/new`} className="rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
          + Tạo gói mới
        </Link>
      </div>

      {packages.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-500 mb-2">Chưa có gói liệu trình nào</p>
          <p className="text-sm text-slate-400 mb-4">Tạo gói để khách mua 1 lần dùng nhiều buổi (VD: trắng da 10 buổi).</p>
          <Link href={`/${params.slug}/packages/new`} className="inline-flex rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
            + Tạo gói đầu tiên
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {packages.map((p) => {
            const pricePerSession = p.priceVnd / p.totalSessions;
            return (
              <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{p.name}</h3>
                    <p className="text-sm text-slate-500">Dịch vụ: {p.serviceName}</p>
                  </div>
                  <Link href={`/${params.slug}/packages/${p.id}/edit`} className="text-brand-600 text-xs hover:underline">Sửa</Link>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-slate-500">Tổng buổi</p>
                    <p className="text-xl font-bold">{p.totalSessions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Giá gói</p>
                    <p className="text-xl font-bold font-mono">{fmtVnd(p.priceVnd)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Hiệu lực</p>
                    <p className="text-xl font-bold">{p.validDays} ngày</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    {fmtVnd(Math.round(pricePerSession))} / buổi
                  </span>
                  <span className="text-emerald-700 font-medium">
                    Đã bán: {p.soldCount} gói
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </TenantShell>
  );
}
