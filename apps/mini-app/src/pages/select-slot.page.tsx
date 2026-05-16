import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateSlots, getTenant } from '../services/demo-data.js';

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

function nextDays(count: number): Array<{ key: string; iso: string; day: string; num: number }> {
  const out = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    out.push({
      key: d.toISOString().split('T')[0]!,
      iso: d.toISOString(),
      day: i === 0 ? 'Hôm nay' : i === 1 ? 'Mai' : labels[d.getDay()]!,
      num: d.getDate(),
    });
  }
  return out;
}

export function SelectSlotPage() {
  const { slug, serviceId } = useParams();
  const navigate = useNavigate();
  const tenant = getTenant(slug);
  const service = tenant.services.find((s) => s.id === serviceId);
  const days = nextDays(7);

  const [selectedStaffId, setSelectedStaffId] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState(days[0]!.key);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  if (!service) {
    return (
      <div>
        <div className="app-bar">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <h1>Lỗi</h1>
        </div>
        <div className="empty">Không tìm thấy dịch vụ.</div>
      </div>
    );
  }

  const slots = generateSlots(selectedDate);

  function onConfirm() {
    if (!selectedTime) return;
    const params = new URLSearchParams({
      serviceId: service!.id,
      staffId: selectedStaffId,
      date: selectedDate,
      time: selectedTime,
    });
    navigate(`/tenants/${slug}/confirm?${params.toString()}`);
  }

  const selectedSlot = slots.find((s) => s.time === selectedTime);
  const isPeak = selectedSlot?.isPeak ?? false;
  const depositRequired = isPeak ? service.depositPeakVnd : 0;

  return (
    <div>
      <div className="app-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1>{service.name}</h1>
      </div>

      <div className="page">
        <div className="section-title">Chọn thợ / KTV</div>
        <div className="staff-list">
          <div
            className={`staff-card ${selectedStaffId === 'any' ? 'active' : ''}`}
            onClick={() => setSelectedStaffId('any')}
          >
            <div className="staff-avatar">?</div>
            <div className="name">Bất kỳ</div>
            <div className="role">Slot trống đầu tiên</div>
          </div>
          {tenant.staff.map((st) => (
            <div
              key={st.id}
              className={`staff-card ${selectedStaffId === st.id ? 'active' : ''}`}
              onClick={() => setSelectedStaffId(st.id)}
            >
              <div className="staff-avatar">{st.name.charAt(0)}</div>
              <div className="name">{st.name}</div>
              <div className="role">⭐ {st.rating}</div>
            </div>
          ))}
        </div>

        <div className="section-title">Chọn ngày</div>
        <div className="date-picker">
          {days.map((d) => (
            <div
              key={d.key}
              className={`date-chip ${selectedDate === d.key ? 'active' : ''}`}
              onClick={() => {
                setSelectedDate(d.key);
                setSelectedTime(null);
              }}
            >
              <div className="day">{d.day}</div>
              <div className="num">{d.num}</div>
            </div>
          ))}
        </div>

        <div className="section-title">
          Chọn giờ
          {slots.some((s) => s.isPeak) && (
            <span className="peak-badge" style={{ marginLeft: 8 }}>cao điểm</span>
          )}
        </div>
        <div className="slot-grid">
          {slots.map((s) => (
            <button
              key={s.time}
              className={`slot-btn ${s.available ? 'available' : 'unavailable'} ${s.isPeak ? 'peak' : ''} ${selectedTime === s.time ? 'selected' : ''}`}
              disabled={!s.available}
              onClick={() => setSelectedTime(s.time)}
            >
              {s.time}
            </button>
          ))}
        </div>

        {selectedTime && depositRequired > 0 && (
          <div className="alert alert-warning" style={{ marginTop: 16 }}>
            ⚠️ Slot {selectedTime} là giờ cao điểm — cần cọc {fmtVnd(depositRequired)} để giữ chỗ. Hoàn 100% nếu huỷ trước 24h.
          </div>
        )}
      </div>

      {selectedTime && (
        <div className="bottom-bar">
          <div className="price">
            <div className="label">{selectedTime} · {service.durationMinutes} phút</div>
            <div className="value">{fmtVnd(service.priceVnd)}</div>
          </div>
          <button className="btn" onClick={onConfirm}>
            {depositRequired > 0 ? 'Tiếp tục thanh toán' : 'Tiếp tục →'}
          </button>
        </div>
      )}
    </div>
  );
}
