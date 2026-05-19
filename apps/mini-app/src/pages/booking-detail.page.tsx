import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api, type BookingDetailDto } from '../services/api.client.js';

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

const STATUS_META: Record<string, { emoji: string; label: string }> = {
  pending: { emoji: '⏳', label: 'Đang chờ cọc' },
  confirmed: { emoji: '✅', label: 'Đã xác nhận' },
  checked_in: { emoji: '🚪', label: 'Đã check-in' },
  in_service: { emoji: '✂️', label: 'Đang làm' },
  completed: { emoji: '🎉', label: 'Hoàn tất' },
  cancelled: { emoji: '❌', label: 'Đã huỷ' },
  no_show: { emoji: '⏰', label: 'Khách bỏ hẹn' },
};

const DEFAULT_TENANT = 'salon-hang';

export function BookingDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const slug = search.get('slug') ?? DEFAULT_TENANT;

  const [booking, setBooking] = useState<BookingDetailDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  async function load() {
    try {
      setError(null);
      const b = await api.bookingDetail(slug, id);
      setBooking(b);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => { void load(); }, [slug, id]);

  async function onCancel() {
    if (!confirm('Huỷ booking này? Cọc có thể bị giữ một phần theo chính sách tiệm.')) return;
    setCancelling(true);
    try {
      const result = await api.cancelBooking(slug, id);
      alert(`Đã huỷ. Hoàn lại: ${fmtVnd(result.refundAmountVnd)}`);
      await load();
    } catch (err) {
      alert(`Lỗi: ${(err as Error).message}`);
    } finally {
      setCancelling(false);
    }
  }

  if (error) {
    return (
      <div>
        <div className="app-bar">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <h1>Lỗi</h1>
        </div>
        <div style={{ padding: 24, color: '#dc2626' }}>{error}</div>
      </div>
    );
  }
  if (!booking) {
    return <div className="page" style={{ padding: 24 }}>Đang tải…</div>;
  }

  const d = new Date(booking.startAt);
  const dateStr = d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const meta = STATUS_META[booking.status] ?? { emoji: '❓', label: booking.status };
  const remaining = (booking.finalPriceVnd ?? booking.servicePriceVnd) - booking.depositPaidVnd;
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canReview = booking.status === 'completed';

  return (
    <div>
      <div className="app-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1>Chi tiết booking</h1>
      </div>

      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>{meta.emoji}</div>
          <div style={{ fontWeight: 600, fontSize: 18 }}>{meta.label}</div>
          <div style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 13, fontFamily: 'monospace' }}>
            {booking.bookingId.slice(0, 8)}…
          </div>
        </div>

        <div className="section-title">Thông tin</div>
        <div className="summary-box">
          <div className="summary-row"><span className="label">Tiệm</span><span className="value">{booking.tenantName}</span></div>
          <div className="summary-row"><span className="label">Dịch vụ</span><span className="value">{booking.serviceName}</span></div>
          <div className="summary-row"><span className="label">Thợ / KTV</span><span className="value">{booking.staffName}</span></div>
          <div className="summary-row"><span className="label">Ngày</span><span className="value">{dateStr}</span></div>
          <div className="summary-row">
            <span className="label">Giờ</span>
            <span className="value">{timeStr} {booking.isPeakSlot && <span className="peak-badge">cao điểm</span>}</span>
          </div>
          <div className="summary-row"><span className="label">Thời lượng</span><span className="value">{booking.durationMinutes} phút</span></div>
        </div>

        <div className="section-title">Thanh toán</div>
        <div className="summary-box">
          <div className="summary-row"><span className="label">Giá dịch vụ</span><span className="value">{fmtVnd(booking.servicePriceVnd)}</span></div>
          <div className="summary-row"><span className="label">Cọc đã trả</span><span className="value" style={{ color: 'var(--success)' }}>{fmtVnd(booking.depositPaidVnd)}</span></div>
          {booking.finalPriceVnd !== null && (
            <div className="summary-row"><span className="label">Giá cuối</span><span className="value">{fmtVnd(booking.finalPriceVnd)}</span></div>
          )}
          {remaining > 0 && booking.status !== 'cancelled' && (
            <div className="summary-row total"><span className="label">Còn lại trả tại tiệm</span><span className="value">{fmtVnd(remaining)}</span></div>
          )}
        </div>

        {booking.status === 'pending' && (
          <div style={{ padding: 12, background: '#fef3c7', borderRadius: 10, fontSize: 13, color: '#854d0e' }}>
            ⚠️ Cần thanh toán cọc để giữ chỗ.
          </div>
        )}
        {booking.status === 'confirmed' && (
          <div style={{ padding: 12, background: '#dbeafe', borderRadius: 10, fontSize: 13, color: '#1e3a8a' }}>
            📱 Chúng tôi sẽ nhắc qua Zalo trước 24h + 2h.
          </div>
        )}

        {canReview && (
          <button
            className="btn-secondary"
            style={{ marginTop: 12, background: '#fef3c7', borderColor: '#fde68a', color: '#854d0e' }}
            onClick={() => navigate(`/my-bookings/${booking.bookingId}/review?slug=${slug}`)}
          >
            ⭐ Đánh giá lượt này
          </button>
        )}

        {canCancel && (
          <button
            className="btn"
            style={{ marginTop: 12, background: '#dc2626' }}
            onClick={onCancel}
            disabled={cancelling}
          >
            {cancelling ? 'Đang huỷ…' : 'Huỷ booking'}
          </button>
        )}
      </div>
    </div>
  );
}
