import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAvailability } from '../services/api.client.js';

interface SlotVM {
  startAt: string;
  available: boolean;
}

export function SelectSlotPage() {
  const { slug, serviceId } = useParams();
  const [slots, setSlots] = useState<SlotVM[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]!);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || !serviceId) return;
    setLoading(true);
    fetchAvailability(slug, { date, serviceId })
      .then((data) => setSlots(data.slots))
      .finally(() => setLoading(false));
  }, [slug, serviceId, date]);

  return (
    <div className="page">
      <h2>Chọn giờ</h2>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      {loading ? (
        <div>Đang tải…</div>
      ) : (
        <div className="slot-grid">
          {slots.map((s) => (
            <button key={s.startAt} disabled={!s.available} className={s.available ? 'available' : 'busy'}>
              {new Date(s.startAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
