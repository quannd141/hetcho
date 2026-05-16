import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getTenant } from '../services/demo-data.js';

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export function ConfirmPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [agreed, setAgreed] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const tenant = getTenant(slug);
  const service = tenant.services.find((s) => s.id === params.get('serviceId'));
  const staffId = params.get('staffId');
  const staff = staffId === 'any' ? null : tenant.staff.find((s) => s.id === staffId);
  const date = params.get('date') ?? '';
  const time = params.get('time') ?? '';

  if (!service) {
    return <div className="empty">Thiếu thông tin booking</div>;
  }

  const startAt = new Date(`${date}T${time}:00`);
  const dayOfWeek = startAt.getDay();
  const isPeak = (dayOfWeek === 0 || dayOfWeek === 6) && startAt.getHours() >= 14;
  const depositRequired = isPeak ? service.depositPeakVnd : 0;

  function onConfirm() {
    setSubmitting(true);
    setTimeout(() => {
      if (depositRequired > 0) {
        alert('Stub: redirect VNPay payment page. Sau Sprint 4 sẽ wire thật.');
      }
      navigate('/my-bookings');
    }, 800);
  }

  const fmtDate = startAt.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div>
      <div className="app-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1>Xác nhận đặt lịch</h1>
      </div>

      <div className="page">
        <div className="section-title">Tiệm</div>
        <div className="card">
          <div style={{ fontWeight: 600 }}>{tenant.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>📍 {tenant.address}</div>
        </div>

        <div className="section-title">Chi tiết</div>
        <div className="summary-box">
          <div className="summary-row">
            <span className="label">Dịch vụ</span>
            <span className="value">{service.name}</span>
          </div>
          <div className="summary-row">
            <span className="label">Thợ / KTV</span>
            <span className="value">{staff?.name ?? 'Bất kỳ (auto-assign)'}</span>
          </div>
          <div className="summary-row">
            <span className="label">Ngày</span>
            <span className="value">{fmtDate}</span>
          </div>
          <div className="summary-row">
            <span className="label">Giờ</span>
            <span className="value">
              {time} {isPeak && <span className="peak-badge">cao điểm</span>}
            </span>
          </div>
          <div className="summary-row">
            <span className="label">Thời lượng</span>
            <span className="value">{service.durationMinutes} phút</span>
          </div>
        </div>

        <div className="section-title">Khách hàng</div>
        <div className="card">
          <div style={{ fontWeight: 600 }}>Tùng Nguyễn (từ Zalo)</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>📱 0901xxx234</div>
        </div>

        <div className="section-title">Thanh toán</div>
        <div className="summary-box">
          <div className="summary-row">
            <span className="label">Giá dịch vụ</span>
            <span className="value">{fmtVnd(service.priceVnd)}</span>
          </div>
          {depositRequired > 0 ? (
            <>
              <div className="summary-row">
                <span className="label">Cọc giữ chỗ (giờ cao điểm)</span>
                <span className="value" style={{ color: 'var(--brand-dark)' }}>{fmtVnd(depositRequired)}</span>
              </div>
              <div className="summary-row total">
                <span className="label">Trả ngay</span>
                <span className="value">{fmtVnd(depositRequired)}</span>
              </div>
              <div className="summary-row">
                <span className="label">Còn lại trả tại tiệm</span>
                <span className="value">{fmtVnd(service.priceVnd - depositRequired)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="summary-row">
                <span className="label">Cọc</span>
                <span className="value" style={{ color: 'var(--success)' }}>Miễn phí (giờ thường)</span>
              </div>
              <div className="summary-row total">
                <span className="label">Trả tại tiệm</span>
                <span className="value">{fmtVnd(service.priceVnd)}</span>
              </div>
            </>
          )}
        </div>

        {depositRequired > 0 && (
          <div className="alert alert-info">
            💳 Bạn sẽ được chuyển sang trang VNPay để thanh toán cọc {fmtVnd(depositRequired)}. Hoàn 100% nếu huỷ trước 24h.
          </div>
        )}

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 0', fontSize: 13 }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 2 }} />
          <span>Tôi đồng ý với <a href="#" style={{ color: 'var(--brand)' }}>chính sách huỷ</a> của tiệm: huỷ trước 24h hoàn 100%, sau đó giữ 50% cọc.</span>
        </label>
      </div>

      <div className="bottom-bar">
        <div className="price">
          <div className="label">Trả ngay</div>
          <div className="value">{depositRequired > 0 ? fmtVnd(depositRequired) : 'Miễn phí'}</div>
        </div>
        <button
          className="btn"
          disabled={!agreed || submitting}
          onClick={onConfirm}
        >
          {submitting ? 'Đang xử lý…' : depositRequired > 0 ? 'Thanh toán cọc' : 'Xác nhận đặt'}
        </button>
      </div>
    </div>
  );
}
