import { useParams, useNavigate } from 'react-router-dom';
import { getTenant } from '../services/demo-data.js';

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export function SelectServicePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const tenant = getTenant(slug);

  return (
    <div>
      <div className="app-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1>Chọn dịch vụ</h1>
      </div>

      <div className="page">
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 12 }}>
          {tenant.name} · {tenant.services.length} dịch vụ
        </p>

        {tenant.services.map((s) => (
          <div
            key={s.id}
            className="service-item"
            onClick={() => navigate(`/tenants/${slug}/slot/${s.id}`)}
          >
            <div className="info">
              <div className="name">{s.name}</div>
              <div className="meta">{s.category} · {s.durationMinutes} phút</div>
              {s.description && (
                <div className="meta" style={{ marginTop: 4 }}>{s.description}</div>
              )}
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
      </div>
    </div>
  );
}
