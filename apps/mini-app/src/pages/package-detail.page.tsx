import { Link, useNavigate, useParams } from 'react-router-dom';
import { getPackageById, getPackageUsages } from '../services/demo-data.js';

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export function PackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pkg = id ? getPackageById(id) : undefined;

  if (!pkg) {
    return (
      <div>
        <div className="app-bar">
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 0, fontSize: 18 }}>←</button>
          <h1>Gói liệu trình</h1>
        </div>
        <div className="page">
          <div className="empty">
            <p>Không tìm thấy gói liệu trình</p>
            <Link to="/my-packages" className="btn btn-outline" style={{ marginTop: 16 }}>
              Quay về danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const usages = getPackageUsages(pkg.id);
  const used = pkg.totalSessions - pkg.remaining;
  const percent = Math.round((used / pkg.totalSessions) * 100);
  const isLow = pkg.remaining <= 1;
  const isDepleted = pkg.remaining === 0;
  const pricePerSession = Math.round(pkg.pricePaidVnd / pkg.totalSessions);

  return (
    <div>
      <div className="app-bar">
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 0, fontSize: 18, marginRight: 8 }}>←</button>
        <h1>Chi tiết gói</h1>
      </div>

      <div className="page">
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{pkg.tenantName}</div>
          <div style={{ fontWeight: 700, fontSize: 17, marginTop: 4 }}>{pkg.name}</div>

          <div className="progress-bar" style={{ marginTop: 16 }}>
            <div className="fill" style={{ width: `${percent}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
            <span>Đã dùng <strong>{used}</strong> / {pkg.totalSessions} buổi</span>
            <span style={{ color: isDepleted ? 'var(--text-muted)' : isLow ? '#dc2626' : 'var(--brand-dark)', fontWeight: 600 }}>
              {isDepleted ? 'Đã hết' : `Còn ${pkg.remaining} buổi`}
            </span>
          </div>

          {isLow && !isDepleted && (
            <div style={{ marginTop: 12, padding: 10, background: '#fef3c7', borderRadius: 6, fontSize: 13, color: '#92400e' }}>
              ⚠️ Sắp hết — chỉ còn {pkg.remaining} buổi. Đặt sớm để không lỡ liệu trình.
            </div>
          )}

          <div style={{ marginTop: 16, display: 'grid', gap: 8, fontSize: 13 }}>
            <Row label="Dịch vụ" value={pkg.serviceName} />
            <Row label="Ngày mua" value={pkg.purchasedAt} />
            <Row label="Hết hạn" value={pkg.expiresAt} />
            <Row label="Tổng trả" value={fmtVnd(pkg.pricePaidVnd)} />
            <Row label="Trung bình / buổi" value={fmtVnd(pricePerSession)} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Lịch sử buổi đã dùng ({usages.length})</div>
          {usages.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 16 }}>
              Bạn chưa sử dụng buổi nào trong gói này.
            </div>
          ) : (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {usages.map((u, idx) => (
                <li key={u.bookingId} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingTop: idx > 0 ? 12 : 0, paddingBottom: 12, borderBottom: idx < usages.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                    {usages.length - idx}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{u.date}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                      {u.serviceName} · {u.staffName}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {!isDepleted ? (
          <Link
            to={`/tenants/${pkg.tenantSlug}/slot/${pkg.serviceId}?packageId=${pkg.id}`}
            className="btn btn-primary"
            style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
          >
            Đặt buổi tiếp theo
          </Link>
        ) : (
          <Link
            to={`/tenants/${pkg.tenantSlug}/services`}
            className="btn btn-outline"
            style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
          >
            Mua gói mới
          </Link>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
