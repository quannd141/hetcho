import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { api, type ServiceDto, type StaffDto, type TenantDto } from '../services/api.client.js';

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';
const SESSION_KEY = 'hetcho_mock_customer';

interface MockCustomer { name: string; phone: string }

function readCustomer(): MockCustomer {
  if (typeof window === 'undefined') return { name: '', phone: '' };
  try {
    return JSON.parse(window.localStorage.getItem(SESSION_KEY) ?? '{"name":"","phone":""}');
  } catch {
    return { name: '', phone: '' };
  }
}

function saveCustomer(c: MockCustomer): void {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(c));
}

export function ConfirmPage() {
  const { slug = 'salon-hang' } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const serviceId = params.get('serviceId') ?? '';
  const staffId = params.get('staffId') ?? '';
  const startAtIso = params.get('startAt') ?? '';

  const [tenant, setTenant] = useState<TenantDto | null>(null);
  const [service, setService] = useState<ServiceDto | null>(null);
  const [staff, setStaff] = useState<StaffDto | null>(null);
  const [agreed, setAgreed] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<MockCustomer>(readCustomer());

  useEffect(() => {
    (async () => {
      try {
        const [t, services, staffList] = await Promise.all([
          api.tenant(slug),
          api.services(slug),
          api.staff(slug),
        ]);
        setTenant(t);
        setService(services.find((s) => s.id === serviceId) ?? null);
        setStaff(staffList.find((s) => s.id === staffId) ?? null);
      } catch (err) {
        setError((err as Error).message);
      }
    })();
  }, [slug, serviceId, staffId]);

  if (error) return <div className="page" style={{ padding: 24, color: '#dc2626' }}>{error}</div>;
  if (!tenant || !service) return <div className="page" style={{ padding: 24 }}>Đang tải…</div>;

  const startAt = new Date(startAtIso);
  const dayOfWeek = startAt.getDay();
  const isPeak = (dayOfWeek === 0 || dayOfWeek === 6) && startAt.getHours() >= 14;
  const depositRequired = isPeak ? service.depositPeakVnd : service.depositNormalVnd;

  const fmtDate = startAt.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  const fmtTime = `${String(startAt.getHours()).padStart(2, '0')}:${String(startAt.getMinutes()).padStart(2, '0')}`;

  const canSubmit = agreed
    && customer.name.trim().length >= 1
    && /^0\d{9}$/.test(customer.phone)
    && !!staff
    && !submitting;

  async function onConfirm() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      saveCustomer(customer);
      const result = await api.createBooking(slug, {
        serviceId,
        staffId,
        startAt: startAtIso,
        customer,
      });

      if (result.requiresPayment) {
        await api.confirmMock(slug, result.bookingId);
      }
      navigate('/my-bookings');
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

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
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>📍 {tenant.timezone}</div>
        </div>

        <div className="section-title">Chi tiết</div>
        <div className="summary-box">
          <div className="summary-row"><span className="label">Dịch vụ</span><span className="value">{service.name}</span></div>
          <div className="summary-row"><span className="label">Thợ / KTV</span><span className="value">{staff?.name ?? '—'}</span></div>
          <div className="summary-row"><span className="label">Ngày</span><span className="value">{fmtDate}</span></div>
          <div className="summary-row">
            <span className="label">Giờ</span>
            <span className="value">{fmtTime} {isPeak && <span className="peak-badge">cao điểm</span>}</span>
          </div>
          <div className="summary-row"><span className="label">Thời lượng</span><span className="value">{service.durationMinutes} phút</span></div>
        </div>

        <div className="section-title">Thông tin của bạn</div>
        <div className="card" style={{ padding: 0 }}>
          <label style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Họ tên</span>
            <input
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              placeholder="VD: Nguyễn Văn A"
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: 15 }}
            />
          </label>
          <label style={{ display: 'block', padding: '12px 16px' }}>
            <span style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4 }}>Số điện thoại</span>
            <input
              type="tel"
              pattern="0\d{9}"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              placeholder="0901234567"
              style={{ width: '100%', border: 'none', outline: 'none', fontSize: 15, fontFamily: 'monospace' }}
            />
          </label>
        </div>

        <div className="section-title">Thanh toán</div>
        <div className="summary-box">
          <div className="summary-row"><span className="label">Giá dịch vụ</span><span className="value">{fmtVnd(service.priceVnd)}</span></div>
          {depositRequired > 0 ? (
            <>
              <div className="summary-row">
                <span className="label">Cọc giữ chỗ {isPeak && '(giờ cao điểm)'}</span>
                <span className="value" style={{ color: 'var(--brand-dark)' }}>{fmtVnd(depositRequired)}</span>
              </div>
              <div className="summary-row total"><span className="label">Trả ngay (mock VNPay)</span><span className="value">{fmtVnd(depositRequired)}</span></div>
              <div className="summary-row"><span className="label">Còn lại trả tại tiệm</span><span className="value">{fmtVnd(service.priceVnd - depositRequired)}</span></div>
            </>
          ) : (
            <>
              <div className="summary-row"><span className="label">Cọc</span><span className="value" style={{ color: 'var(--success)' }}>Miễn phí</span></div>
              <div className="summary-row total"><span className="label">Trả tại tiệm</span><span className="value">{fmtVnd(service.priceVnd)}</span></div>
            </>
          )}
        </div>

        {depositRequired > 0 && (
          <div style={{ padding: 12, background: '#dbeafe', borderRadius: 10, fontSize: 13, color: '#1e3a8a', marginTop: 12 }}>
            💳 Mock mode — bấm "Thanh toán cọc" sẽ auto-confirm. Sprint 4 sẽ wire VNPay thật.
          </div>
        )}

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 0', fontSize: 13 }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 2 }} />
          <span>Tôi đồng ý chính sách huỷ: huỷ trước 24h hoàn 100%, sau đó giữ 50% cọc.</span>
        </label>

        {error && <div style={{ padding: 12, background: '#fee2e2', color: '#991b1b', borderRadius: 10, fontSize: 13 }}>{error}</div>}
      </div>

      <div className="bottom-bar">
        <div className="price">
          <div className="label">Trả ngay</div>
          <div className="value">{depositRequired > 0 ? fmtVnd(depositRequired) : 'Miễn phí'}</div>
        </div>
        <button className="btn" disabled={!canSubmit} onClick={onConfirm}>
          {submitting ? 'Đang xử lý…' : depositRequired > 0 ? 'Thanh toán cọc' : 'Xác nhận đặt'}
        </button>
      </div>
    </div>
  );
}
