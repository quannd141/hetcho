import Link from 'next/link';

interface PageProps {
  params: { slug: string };
}

export default function DashboardPage({ params }: PageProps) {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-brand-600">HếtChờ</Link>
            <span className="text-slate-300">|</span>
            <span className="font-medium">{params.slug}</span>
          </div>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href={`/${params.slug}/dashboard`} className="text-brand-600">Lịch hôm nay</Link>
            <Link href={`/${params.slug}/services`}>Dịch vụ</Link>
            <Link href={`/${params.slug}/staff`}>Thợ / KTV</Link>
            <Link href={`/${params.slug}/customers`}>Khách hàng</Link>
            <Link href={`/${params.slug}/settings`}>Cấu hình</Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <StatCard label="Booking hôm nay" value="0" />
          <StatCard label="Khách check-in" value="0" />
          <StatCard label="Doanh thu hôm nay" value="0 ₫" />
          <StatCard label="No-show" value="0" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Lịch hôm nay (Sprint 2 sẽ implement)</h2>
          <p className="text-slate-500 text-sm">
            Grid view: trục Y = thợ, trục X = giờ slot 30 phút. Realtime auto refresh khi có booking mới qua Zalo.
          </p>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
