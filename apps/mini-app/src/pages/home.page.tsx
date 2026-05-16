import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTenant } from '../services/demo-data.js';

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export function HomePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const tenant = getTenant(slug);

  return (
    <div>
      <div className="hero">
        <h1>{tenant.name}</h1>
        <p>{tenant.type} · ⭐ {tenant.rating} ({tenant.reviewCount} đánh giá)</p>
      </div>

      <div className="tenant-card">
        <div className="name">{tenant.name}</div>
        <div className="meta">📍 {tenant.address}</div>
        <div className="meta" style={{ marginTop: 8 }}>
          🕐 Mở cửa T2-CN: 08:00 - 22:00
        </div>
      </div>

      <div className="page">
        <button className="btn" onClick={() => navigate(`/tenants/${tenant.slug}/services`)}>
          📅 Đặt lịch ngay
        </button>

        <div className="section-title" style={{ marginTop: 24 }}>Dịch vụ phổ biến</div>
        {tenant.services.slice(0, 3).map((s) => (
          <Link
            key={s.id}
            to={`/tenants/${tenant.slug}/slot/${s.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="service-item">
              <div className="info">
                <div className="name">{s.name}</div>
                <div className="meta">{s.durationMinutes} phút</div>
              </div>
              <div className="price">{fmtVnd(s.priceVnd)}</div>
            </div>
          </Link>
        ))}

        <div className="section-title">Thợ / KTV</div>
        <div className="staff-list">
          {tenant.staff.map((st) => (
            <div key={st.id} className="staff-card">
              <div className="staff-avatar">{st.name.charAt(0)}</div>
              <div className="name">{st.name}</div>
              <div className="role">⭐ {st.rating} · {st.bookingCount} booking</div>
            </div>
          ))}
        </div>

        <div className="footer">powered by HếtChờ</div>
      </div>
    </div>
  );
}
