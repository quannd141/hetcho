import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HếtChờ — Đặt là vào liền',
  description: 'Nền tảng đặt lịch miễn phí cho salon, spa, nail, gội đầu. Khách đặt qua Zalo, vào ghế đúng giờ.',
  metadataBase: new URL('https://hetcho.vn'),
  openGraph: {
    title: 'HếtChờ — Đặt là vào liền',
    description: 'Booking SaaS zero-fee cho tiệm làm đẹp nhỏ',
    locale: 'vi_VN',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
