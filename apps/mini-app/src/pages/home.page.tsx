import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, type ServiceDto, type StaffDto, type TenantDto } from '../services/api.client.js';

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

export function HomePage() {
  const { slug = 'salon-hang' } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<TenantDto | null>(null);
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [staff, setStaff] = useState<StaffDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [t, sv, st] = await Promise.all([
          api.tenant(slug),
          api.services(slug),
          api.staff(slug),
        ]);
        if (!mounted) return;
        setTenant(t);
        setServices(sv);
        setStaff(st);
      } catch (err) {
        if (mounted) setError((err as Error).message);
      }
    })();
    return () => { mounted = false; };
  }, [slug]);

  if (error) {
    return (
      <div className="page" style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <h2>Không tải được dữ liệu tiệm</h2>
        <p style={{ color: '#64748b', marginTop: 8 }}>{error}</p>
        <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 16 }}>
          Kiểm tra web server có chạy ở :3300 chưa.
        </p>
      </div>
    );
  }

  if (!tenant) {
    return <div className="page" style={{ padding: 24 }}>Đang tải…</div>;
  }

  const openMon = tenant.workingHours.mon;
  const hoursLabel = openMon ? `${openMon.open} - ${openMon.close}` : 'Nghỉ';

  return (
    <div>
      <div className="hero">
        <h1>{tenant.name}</h1>
        <p>{labelType(tenant.type)} · 🌟 Đặt là vào liền</p>
      </div>

      <div className="tenant-card">
        <div className="name">{tenant.name}</div>
        <div className="meta">📍 {tenant.timezone}</div>
        <div className="meta" style={{ marginTop: 8 }}>🕐 T2-CN: {hoursLabel}</div>
      </div>

      <div className="page">
        <button className="btn" onClick={() => navigate(`/tenants/${tenant.slug}/services`)}>
          📅 Đặt lịch ngay
        </button>

        <div className="section-title" style={{ marginTop: 24 }}>Dịch vụ phổ biến</div>
        {services.length === 0 && <div style={{ color: '#94a3b8', fontSize: 13 }}>Tiệm chưa có dịch vụ.</div>}
        {services.slice(0, 3).map((s) => (
          <Link
            key={s.id}
            to={`/tenants/${tenant.slug}/slot/${s.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="service-item">
              <div className="info">
                <div className="name">{s.name}</div>
                <div className="meta">{s.durationMinutes} phút{s.category ? ` · ${s.category}` : ''}</div>
              </div>
              <div className="price">{fmtVnd(s.priceVnd)}</div>
            </div>
          </Link>
        ))}

        <div className="section-title">Thợ / KTV</div>
        <div className="staff-list">
          {staff.map((st) => (
            <div key={st.id} className="staff-card">
              <div className="staff-avatar">{st.name.charAt(0)}</div>
              <div className="name">{st.name}</div>
              <div className="role">{st.serviceIds.length} dịch vụ</div>
            </div>
          ))}
        </div>

        <div className="footer">powered by HếtChờ</div>
      </div>
    </div>
  );
}

function labelType(t: string): string {
  switch (t) {
    case 'salon_toc': return 'Salon tóc';
    case 'spa_skincare': return 'Spa skincare';
    case 'nail': return 'Nail';
    case 'barber': return 'Barber';
    case 'goi_dau': return 'Gội đầu dưỡng sinh';
    case 'massage': return 'Massage';
    default: return 'Tiệm làm đẹp';
  }
}
