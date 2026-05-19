import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api.client.js';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3300/api';

export function ReviewPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const slug = search.get('slug') ?? 'salon-hang';

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existing, setExisting] = useState<{ rating: number; comment: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/public/tenants/${slug}/bookings/${id}/review`, {
          credentials: 'include',
        });
        const json = await res.json();
        if (json.success && json.data) {
          setExisting(json.data);
          setRating(json.data.rating);
          setComment(json.data.comment);
        }
      } catch {/* no-op */}
    })();
  }, [slug, id]);

  async function onSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/public/tenants/${slug}/bookings/${id}/review`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message ?? 'Lỗi không xác định');
      alert('Cảm ơn anh/chị đã đánh giá! 🙏');
      navigate(`/my-bookings/${id}?slug=${slug}`);
    } catch (err) {
      alert(`Lỗi: ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="app-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1>Đánh giá lượt làm</h1>
      </div>

      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: 20 }}>
          <div style={{ fontSize: 32 }}>⭐</div>
          <div style={{ fontWeight: 600, marginTop: 8 }}>
            {existing ? 'Bạn đã đánh giá lượt này' : 'Lượt làm thế nào?'}
          </div>
        </div>

        <div className="section-title">Sao</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: 12 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 36,
                cursor: 'pointer',
                color: n <= rating ? '#facc15' : '#cbd5e1',
              }}
              aria-label={`${n} sao`}
            >
              ★
            </button>
          ))}
        </div>
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: 13 }}>
          {rating === 5 && 'Tuyệt vời'}
          {rating === 4 && 'Hài lòng'}
          {rating === 3 && 'Bình thường'}
          {rating === 2 && 'Chưa ổn'}
          {rating === 1 && 'Không hài lòng'}
        </div>

        <div className="section-title" style={{ marginTop: 16 }}>Nhận xét (tuỳ chọn)</div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="VD: Stylist Hằng rất tâm lý, tóc đẹp hơn cả mong đợi..."
          maxLength={500}
          style={{
            width: '100%',
            padding: 12,
            border: '1px solid #cbd5e1',
            borderRadius: 10,
            fontSize: 14,
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ textAlign: 'right', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
          {comment.length}/500
        </div>

        <button
          className="btn"
          style={{ marginTop: 16 }}
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? 'Đang gửi…' : existing ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
        </button>
      </div>
    </div>
  );
}
