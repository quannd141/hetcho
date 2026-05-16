import Link from 'next/link';

interface PageProps {
  params: { slug: string };
}

export default async function ServicesPage({ params }: PageProps) {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-brand-600">HếtChờ</Link>
            <span className="text-slate-300">|</span>
            <span className="font-medium">{params.slug} — Dịch vụ</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Quản lý dịch vụ</h1>
          <Link
            href={`/${params.slug}/services/new`}
            className="rounded-md bg-brand-600 px-4 py-2 text-white text-sm font-medium hover:bg-brand-700"
          >
            + Thêm dịch vụ
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Tên dịch vụ</th>
                <th className="px-4 py-3 font-semibold">Thời lượng</th>
                <th className="px-4 py-3 font-semibold">Giá</th>
                <th className="px-4 py-3 font-semibold">Cọc thường</th>
                <th className="px-4 py-3 font-semibold">Cọc cao điểm</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  Chưa có dịch vụ nào. Sprint 1+ wire AddServiceUseCase để fetch + add.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
