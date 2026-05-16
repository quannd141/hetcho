import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const returnTo = search.get('returnTo') || '/tenants/salon-hang';
  const [step, setStep] = useState<'choose' | 'phone'>('choose');
  const [phone, setPhone] = useState('');

  return (
    <div className="page">
      <div style={{ padding: '32px 20px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>👋</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Chào mừng đến HếtChờ</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Đăng nhập để xem lịch đã đặt, liệu trình + nhận voucher.
        </p>
      </div>

      {step === 'choose' && (
        <div style={{ padding: '0 20px' }}>
          <button
            className="btn-primary"
            onClick={() => {
              alert('[mock] Mở Zalo SDK → getUserInfo() → redirect');
              navigate(returnTo);
            }}
            style={{ width: '100%', marginBottom: 12, background: '#0068ff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <span style={{ fontSize: 18 }}>💬</span>
            Đăng nhập bằng Zalo (1 chạm)
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0', color: '#94a3b8', fontSize: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            HOẶC
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          <button
            className="btn-secondary"
            onClick={() => setStep('phone')}
            style={{ width: '100%' }}
          >
            📱 Đăng nhập bằng SĐT (OTP)
          </button>

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 24 }}>
            Bằng việc đăng nhập, bạn đồng ý với <Link to="/terms" style={{ color: '#f97316' }}>điều khoản</Link> + <Link to="/privacy" style={{ color: '#f97316' }}>quyền riêng tư</Link>.
          </p>
        </div>
      )}

      {step === 'phone' && (
        <div style={{ padding: '0 20px' }}>
          <button
            onClick={() => setStep('choose')}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 14, marginBottom: 16, cursor: 'pointer' }}
          >
            ← Quay lại
          </button>

          <label style={{ display: 'block', marginBottom: 16 }}>
            <span style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Số điện thoại</span>
            <input
              type="tel"
              pattern="0\d{9}"
              placeholder="0901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 18,
                fontFamily: 'monospace',
                border: '1px solid #cbd5e1',
                borderRadius: 12,
                boxSizing: 'border-box',
              }}
            />
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
              Chúng tôi sẽ gửi mã 6 số qua SMS / Zalo.
            </p>
          </label>

          <button
            className="btn-primary"
            disabled={!/^0\d{9}$/.test(phone)}
            onClick={() => navigate(`/login/otp?phone=${phone}&returnTo=${returnTo}`)}
            style={{ width: '100%' }}
          >
            Gửi mã OTP
          </button>

          <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 16 }}>
            Chưa có Zalo? OTP qua SMS vẫn hoạt động.
          </p>
        </div>
      )}
    </div>
  );
}
