import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type MyBookingDto } from '../services/api.client.js';

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ cọc',
  confirmed: 'Đã xác nhận',
  checked_in: 'Khách đến',
  in_service: 'Đang làm',
  completed: 'Hoàn tất',
  cancelled: 'Đã huỷ',
  no_show: 'Khách bỏ hẹn',
};

const ACTIVE_STATUSES = new Set(['pending', 'confirmed', 'checked_in', 'in_service']);

const DEFAULT_TENANT = 'salon-hang';

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<MyBookingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.myBookings(DEFAULT_TENANT);
        setBookings(res.bookings);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const upcoming = bookings.filter((b) => ACTIVE_STATUSES.has(b.status));
  const past = bookings.filter((b) => !ACTIVE_STATUSES.has(b.status));

  return (
    <div>
      <div className="app-bar">
        <h1>Lịch của tôi</h1>
      </div>

      <div className="page">
        {loading && <p style={{ color: '#64748b' }}>Đang tải…</p>}
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}

        {!loading && !error && bookings.length === 0 ? (
          <div className="empty" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 48 }}>📅</div>
            <p>Bạn chưa có lịch hẹn nào tại {DEFAULT_TENANT}</p>
            <Link to={`/tenants/${DEFAULT_TENANT}`} style={{ display: 'inline-block', marginTop: 16, padding: '10px 20px', background: '#f97316', color: '#fff', borderRadius: 10, textDecoration: 'none' }}>
              Đặt lịch ngay
            </Link>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <div className="section-title">Sắp tới ({upcoming.length})</div>
                {upcoming.map((b) => <BookingCard key={b.bookingId} booking={b} />)}
              </>
            )}

            {past.length > 0 && (
              <>
                <div className="section-title" style={{ marginTop: 16 }}>Lịch sử ({past.length})</div>
                {past.map((b) => <BookingCard key={b.bookingId} booking={b} />)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: MyBookingDto }) {
  const d = new Date(booking.startAt);
  const dateStr = d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  return (
    <Link to={`/my-bookings/${booking.bookingId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card" style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{booking.serviceName}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>
              {booking.bookingId.slice(0, 8)}…
            </div>
          </div>
          <span className={`booking-status ${booking.status}`}>{STATUS_LABEL[booking.status] ?? booking.status}</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 13, display: 'flex', gap: 16, color: 'var(--text-muted)' }}>
          <span>📅 {dateStr} · {timeStr}</span>
          {booking.finalPriceVnd !== null && (
            <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--brand-dark)' }}>{fmtVnd(booking.finalPriceVnd)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
