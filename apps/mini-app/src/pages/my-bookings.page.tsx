import { Link } from 'react-router-dom';
import { getMyBookings } from '../services/demo-data.js';

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ cọc',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn tất',
  cancelled: 'Đã huỷ',
};

export function MyBookingsPage() {
  const bookings = getMyBookings();
  const upcoming = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');
  const past = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div>
      <div className="app-bar">
        <h1>Lịch của tôi</h1>
      </div>

      <div className="page">
        {upcoming.length === 0 && past.length === 0 ? (
          <div className="empty">
            <div className="emoji">📅</div>
            <p>Bạn chưa có lịch hẹn nào</p>
            <Link to="/tenants/salon-hang" className="btn btn-outline" style={{ display: 'inline-block', marginTop: 16 }}>
              Đặt lịch ngay
            </Link>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <div className="section-title">Sắp tới ({upcoming.length})</div>
                {upcoming.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </>
            )}

            {past.length > 0 && (
              <>
                <div className="section-title" style={{ marginTop: 16 }}>Lịch sử</div>
                {past.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: ReturnType<typeof getMyBookings>[number] }) {
  const d = new Date(booking.startAt);
  const dateStr = d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
  const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <Link
      to={`/my-bookings/${booking.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div className="card" style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{booking.serviceName}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
              {booking.tenantName} · {booking.staffName}
            </div>
          </div>
          <span className={`booking-status ${booking.status}`}>
            {STATUS_LABEL[booking.status]}
          </span>
        </div>
        <div style={{ marginTop: 10, fontSize: 13, display: 'flex', gap: 16, color: 'var(--text-muted)' }}>
          <span>📅 {dateStr} · {timeStr}</span>
          <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--brand-dark)' }}>
            {fmtVnd(booking.priceVnd)}
          </span>
        </div>
      </div>
    </Link>
  );
}
