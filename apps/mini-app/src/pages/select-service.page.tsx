import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, type ServiceDto } from '../services/api.client.js';

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export function SelectServicePage() {
  const { slug = 'salon-hang' } = useParams();
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await api.services(slug);
        if (!mounted) return;
        setServices(list);
      } catch (err) {
        if (mounted) setError((err as Error).message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  return (
    <div>
      <div className="app-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1>Chọn dịch vụ</h1>
      </div>

      <div className="page">
        {loading && <p style={{ color: '#64748b' }}>Đang tải dịch vụ…</p>}
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        {!loading && !error && (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 12 }}>
              {services.length} dịch vụ
            </p>

            {services.map((s) => (
              <div
                key={s.id}
                className="service-item"
                onClick={() => navigate(`/tenants/${slug}/slot/${s.id}`)}
              >
                <div className="info">
                  <div className="name">{s.name}</div>
                  <div className="meta">{s.category ?? '—'} · {s.durationMinutes} phút</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="price">{fmtVnd(s.priceVnd)}</div>
                  {s.depositPeakVnd > 0 && (
                    <div className="meta" style={{ marginTop: 2, fontSize: 11 }}>
                      Cọc cao điểm: {fmtVnd(s.depositPeakVnd)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
