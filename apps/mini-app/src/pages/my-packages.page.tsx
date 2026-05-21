import { Link } from 'react-router-dom';
import { getMyPackages } from '../services/demo-data.js';

export function MyPackagesPage() {
  const packages = getMyPackages();

  return (
    <div>
      <div className="app-bar">
        <h1>Liệu trình của tôi</h1>
      </div>

      <div className="page">
        {packages.length === 0 ? (
          <div className="empty">
            <div className="emoji">🎁</div>
            <p>Bạn chưa mua gói liệu trình nào</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>
              Mua gói trọn buổi để tiết kiệm 15-30% so với mua lẻ.
            </p>
            <Link to="/tenants/mai-spa" className="btn btn-outline" style={{ display: 'inline-block', marginTop: 16 }}>
              Khám phá gói
            </Link>
          </div>
        ) : (
          packages.map((p) => {
            const used = p.totalSessions - p.remaining;
            const percent = Math.round((used / p.totalSessions) * 100);
            const isLow = p.remaining <= 1;
            return (
              <Link key={p.id} to={`/my-packages/${p.id}`} className="card" style={{ marginBottom: 12, display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                  {p.tenantName}
                </div>

                <div className="progress-bar">
                  <div className="fill" style={{ width: `${percent}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Đã dùng <strong>{used}</strong> / {p.totalSessions} buổi</span>
                  <span style={{ color: isLow ? '#dc2626' : 'var(--brand-dark)', fontWeight: 600 }}>
                    Còn {p.remaining} buổi {isLow && p.remaining > 0 ? '⚠️' : ''}
                  </span>
                </div>

                <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                  ⏰ Hết hạn: <strong style={{ color: 'var(--text)' }}>{p.expiresAt}</strong>
                </div>

                <div style={{ marginTop: 12, fontSize: 13, color: 'var(--brand-dark)', fontWeight: 600 }}>
                  Xem chi tiết →
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
