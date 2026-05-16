import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchServices } from '../services/api.client.js';

interface ServiceVM {
  id: string;
  name: string;
  durationMinutes: number;
  priceVnd: number;
  category?: string;
}

export function SelectServicePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceVM[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetchServices(slug)
      .then((data) => setServices(data))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div>Đang tải dịch vụ…</div>;

  return (
    <div className="page">
      <h2>Chọn dịch vụ</h2>
      <ul className="service-list">
        {services.map((s) => (
          <li key={s.id} onClick={() => navigate(`/tenants/${slug}/slot/${s.id}`)}>
            <strong>{s.name}</strong>
            <span>{s.durationMinutes} phút · {(s.priceVnd / 1000).toFixed(0)}k</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
