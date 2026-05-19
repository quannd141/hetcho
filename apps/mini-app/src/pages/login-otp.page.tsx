import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api.client.js';

export function LoginOtpPage() {
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const phone = search.get('phone') || '';
  const returnTo = search.get('returnTo') || '/tenants/salon-hang';

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(60);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const code = digits.join('');
  const canSubmit = code.length === 6;

  const handleChange = (i: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[i] = value;
    setDigits(next);
    if (value && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (code !== '000000' && code !== '123456') {
      alert('[mock] Mã sai. Thử 123456 hoặc 000000 để pass.');
      return;
    }
    try {
      const tenantSlug = returnTo.match(/\/tenants\/([^/]+)/)?.[1] ?? 'salon-hang';
      await api.login({ tenantSlug, phone, name: 'Khách HếtChờ' });
      navigate(returnTo);
    } catch (err) {
      alert(`Lỗi: ${(err as Error).message}`);
    }
  };

  const maskedPhone = phone.length === 10 ? `${phone.slice(0, 3)}***${phone.slice(7)}` : phone;

  return (
    <div className="page">
      <div style={{ padding: '32px 20px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🔐</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Nhập mã OTP</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>
          Gửi đến <strong style={{ fontFamily: 'monospace' }}>{maskedPhone}</strong>
        </p>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: 44,
                height: 56,
                fontSize: 24,
                textAlign: 'center',
                fontFamily: 'monospace',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                boxSizing: 'border-box',
              }}
            />
          ))}
        </div>

        <button
          className="btn-primary"
          disabled={!canSubmit}
          onClick={handleSubmit}
          style={{ width: '100%', marginBottom: 12 }}
        >
          Xác nhận
        </button>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          {cooldown > 0 ? (
            <p style={{ color: '#64748b', fontSize: 13 }}>
              Chưa nhận được? Gửi lại sau <strong>{cooldown}s</strong>
            </p>
          ) : (
            <button
              onClick={() => {
                setCooldown(60);
                alert('[mock] Đã gửi lại OTP');
              }}
              style={{ background: 'none', border: 'none', color: '#f97316', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Gửi lại OTP
            </button>
          )}
        </div>

        <div style={{ marginTop: 24, padding: 12, background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, fontSize: 12, color: '#854d0e' }}>
          💡 Mock mode: nhập <strong>123456</strong> hoặc <strong>000000</strong> để vượt qua.
        </div>
      </div>
    </div>
  );
}
