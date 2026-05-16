import { useParams, useNavigate } from 'react-router-dom';

export function HomePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const tenantSlug = slug ?? 'demo';

  return (
    <div className="page">
      <header>
        <h1>{tenantSlug.toUpperCase()}</h1>
        <p>Đặt lịch nhanh qua HếtChờ</p>
      </header>
      <button onClick={() => navigate(`/tenants/${tenantSlug}/services`)}>Bắt đầu đặt lịch</button>
      <footer>powered by HếtChờ</footer>
    </div>
  );
}
