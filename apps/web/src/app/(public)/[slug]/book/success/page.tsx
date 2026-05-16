import Link from 'next/link';

interface PageProps { params: { slug: string }; searchParams: Record<string, string> }

export default function BookingSuccessPage({ params, searchParams }: PageProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-6 py-16 max-w-xl">
        <div className="bg-white border border-emerald-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2">Đặt lịch thành công!</h1>
          <p className="text-slate-600">
            Tiệm <strong>{params.slug}</strong> đã nhận booking của bạn. Bạn sẽ nhận SMS xác nhận trong vòng 5 phút.
          </p>

          <div className="mt-6 bg-slate-50 rounded-lg p-4 text-left text-sm space-y-2">
            <div className="flex justify-between"><span className="text-slate-500">Ngày</span><span className="font-medium">{searchParams.date}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Giờ</span><span className="font-medium">{searchParams.time}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Khách</span><span className="font-medium">{searchParams.customerName}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">SĐT</span><span className="font-medium font-mono">{searchParams.phone}</span></div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
            💡 Cài Zalo OA của tiệm để theo dõi lịch + nhận nhắc T-24h/T-2h tự động.
          </div>

          <div className="mt-8 flex gap-3">
            <Link href={`/${params.slug}/book`} className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
              Đặt thêm
            </Link>
            <Link href="/" className="flex-1 rounded-md bg-brand-600 text-white px-4 py-2 text-sm font-medium hover:bg-brand-700">
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
