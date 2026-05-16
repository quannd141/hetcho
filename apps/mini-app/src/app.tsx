import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { HomePage } from './pages/home.page.js';
import { SelectServicePage } from './pages/select-service.page.js';
import { SelectSlotPage } from './pages/select-slot.page.js';
import { ConfirmPage } from './pages/confirm.page.js';
import { MyBookingsPage } from './pages/my-bookings.page.js';
import { BookingDetailPage } from './pages/booking-detail.page.js';
import { MyPackagesPage } from './pages/my-packages.page.js';
import { ProfilePage } from './pages/profile.page.js';
import { LoginPage } from './pages/login.page.js';
import { LoginOtpPage } from './pages/login-otp.page.js';

export function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/tenants/salon-hang" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/otp" element={<LoginOtpPage />} />
        <Route path="/tenants/:slug" element={<HomePage />} />
        <Route path="/tenants/:slug/services" element={<SelectServicePage />} />
        <Route path="/tenants/:slug/slot/:serviceId" element={<SelectSlotPage />} />
        <Route path="/tenants/:slug/confirm" element={<ConfirmPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/my-bookings/:id" element={<BookingDetailPage />} />
        <Route path="/my-packages" element={<MyPackagesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/tenants/salon-hang" />} />
      </Routes>
      <TabBar />
    </>
  );
}

function TabBar() {
  const location = useLocation();
  const isTenantHome = /^\/tenants\/[^/]+$/.test(location.pathname);
  const isAuthRoute = location.pathname.startsWith('/login');
  const isTopLevel = isTenantHome ||
    location.pathname === '/my-bookings' ||
    location.pathname === '/my-packages' ||
    location.pathname === '/profile';
  if (isAuthRoute || !isTopLevel) return null;

  const active = (path: string) => location.pathname.startsWith(path) ? 'active' : '';

  return (
    <nav className="tab-bar">
      <Link to="/tenants/salon-hang" className={isTenantHome ? 'active' : ''}>
        <span className="icon">🏠</span>
        <span>Tiệm</span>
      </Link>
      <Link to="/my-bookings" className={active('/my-bookings')}>
        <span className="icon">📅</span>
        <span>Lịch của tôi</span>
      </Link>
      <Link to="/my-packages" className={active('/my-packages')}>
        <span className="icon">🎁</span>
        <span>Liệu trình</span>
      </Link>
      <Link to="/profile" className={active('/profile')}>
        <span className="icon">👤</span>
        <span>Tài khoản</span>
      </Link>
    </nav>
  );
}
