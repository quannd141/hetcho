import { useParams, useNavigate } from 'react-router-dom';
import { getMyBookings } from '../services/demo-data.js';

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const booking = getMyBookings().find((b) => b.id === id);

  if (!booking) {
    return (
      <div>
        <div className="app-bar">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <h1>Không tìm thấy</h1>
        </div>
        <div className="empty">Booking không tồn tại.</div>
      </div>
    );
  }

  const d = new Date(booking.startAt);
  const dateStr = d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const remaining = booking.priceVnd - booking.depositPaidVnd;

  return (
    <div>
      <div className="app-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1>Chi tiết booking</h1>
      </div>

      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>
            {booking.status === 'completed' ? '✅' : booking.status === 'confirmed' ? '⏰' : booking.status === 'pending' ? '⏳' : '❌'}
          </div>
          <div style={{ fontWeight: 600, fontSize: 18 }}>
            {booking.status === 'completed' ? 'Đã hoàn tất' : booking.status === 'confirmed' ? 'Đã xác nhận' : booking.status === 'pending' ? 'Đang chờ thanh toán cọc' : 'Đã huỷ'}
          </div>
          <div style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>
            Mã booking: <code>{booking.id}</code>
          </div>
        </div>

        <div className="section-title">Thông tin</div>
        <div className="summary-box">
          <div className="summary-row">
            <span className="label">Tiệm</span>
            <span className="value">{booking.tenantName}</span>
          </div>
          <div className="summary-row">
            <span className="label">Dịch vụ</span>
            <span className="value">{booking.serviceName}</span>
          </div>
          <div className="summary-row">
            <span className="label">Thợ / KTV</span>
            <span className="value">{booking.staffName}</span>
          </div>
          <div className="summary-row">
            <span className="label">Ngày</span>
            <span className="value">{dateStr}</span>
          </div>
          <div className="summary-row">
            <span className="label">Giờ</span>
            <span className="value">{timeStr}</span>
          </div>
        </div>

        <div className="section-title">Thanh toán</div>
        <div className="summary-box">
          <div className="summary-row">
            <span className="label">Tổng tiền</span>
            <span className="value">{fmtVnd(booking.priceVnd)}</span>
          </div>
          <div className="summary-row">
            <span className="label">Đã trả (cọc)</span>
            <span className="value" style={{ color: 'var(--success)' }}>{fmtVnd(booking.depositPaidVnd)}</span>
          </div>
          {remaining > 0 && (
            <div className="summary-row total">
              <span className="label">Còn lại trả tại tiệm</span>
              <span className="value">{fmtVnd(remaining)}</span>
            </div>
          )}
        </div>

        {booking.status === 'pending' && (
          <div className="alert alert-warning">
            ⚠️ Bạn cần thanh toán cọc trong 5 phút nữa để giữ chỗ. Sau đó slot sẽ tự release.
          </div>
        )}

        {booking.status === 'confirmed' && (
          <div className="alert alert-info">
            📱 Chúng tôi sẽ nhắc bạn qua Zalo trước 24h và trước 2h giờ hẹn.
          </div>
        )}

        {booking.status === 'completed' && (
          <button className="btn btn-outline" style={{ marginTop: 12 }}>
            ⭐ Đánh giá lượt này
          </button>
        )}

        {(booking.status === 'confirmed' || booking.status === 'pending') && (
          <>
            <button className="btn btn-secondary" style={{ marginTop: 12 }}>
              📍 Xem đường đi
            </button>
            <button className="btn" style={{ marginTop: 12, background: 'var(--danger)' }}>
              Huỷ booking
            </button>
          </>
        )}
      </div>
    </div>
  );
}
