import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, type AvailabilitySlotDto, type ServiceDto, type StaffDto } from '../services/api.client.js';

const fmtVnd = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

function nextDays(count: number): Array<{ key: string; day: string; num: number }> {
  const out = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    out.push({
      key: `${yyyy}-${mm}-${dd}`,
      day: i === 0 ? 'Hôm nay' : i === 1 ? 'Mai' : labels[d.getDay()]!,
      num: d.getDate(),
    });
  }
  return out;
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function SelectSlotPage() {
  const { slug = 'salon-hang', serviceId = '' } = useParams();
  const navigate = useNavigate();
  const days = nextDays(7);

  const [service, setService] = useState<ServiceDto | null>(null);
  const [staffOptions, setStaffOptions] = useState<StaffDto[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlotDto[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(days[0]!.key);
  const [selectedStartAt, setSelectedStartAt] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [services, staff] = await Promise.all([
          api.services(slug),
          api.staff(slug, serviceId),
        ]);
        const sv = services.find((s) => s.id === serviceId);
        if (!sv) throw new Error('Service not found');
        setService(sv);
        setStaffOptions(staff);
        if (staff.length > 0) setSelectedStaffId(staff[0]!.id);
      } catch (err) {
        setError((err as Error).message);
      }
    })();
  }, [slug, serviceId]);

  useEffect(() => {
    if (!service) return;
    setLoadingSlots(true);
    setSelectedStartAt(null);
    api
      .availability(slug, { date: selectedDate, serviceId })
      .then((res) => setSlots(res.slots))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoadingSlots(false));
  }, [slug, serviceId, selectedDate, service]);

  if (error) {
    return (
      <div>
        <div className="app-bar">
          <button className="back-btn" onClick={() => navigate(-1)}>←</button>
          <h1>Lỗi</h1>
        </div>
        <div style={{ padding: 24, color: '#dc2626' }}>{error}</div>
      </div>
    );
  }

  if (!service) {
    return <div className="page" style={{ padding: 24 }}>Đang tải…</div>;
  }

  const selectedSlot = slots.find((s) => s.startAt === selectedStartAt);
  const isPeak = selectedSlot?.isPeak ?? false;
  const depositRequired = isPeak ? service.depositPeakVnd : service.depositNormalVnd;

  function onConfirm() {
    if (!selectedStartAt || !selectedStaffId) return;
    const params = new URLSearchParams({
      serviceId,
      staffId: selectedStaffId,
      startAt: selectedStartAt,
    });
    navigate(`/tenants/${slug}/confirm?${params.toString()}`);
  }

  return (
    <div>
      <div className="app-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1>{service.name}</h1>
      </div>

      <div className="page">
        <div className="section-title">Chọn thợ / KTV</div>
        <div className="staff-list">
          {staffOptions.length === 0 && (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>Chưa có thợ làm dịch vụ này.</div>
          )}
          {staffOptions.map((st) => (
            <div
              key={st.id}
              className={`staff-card ${selectedStaffId === st.id ? 'active' : ''}`}
              onClick={() => setSelectedStaffId(st.id)}
            >
              <div className="staff-avatar">{st.name.charAt(0)}</div>
              <div className="name">{st.name}</div>
              <div className="role">{st.serviceIds.length} dịch vụ</div>
            </div>
          ))}
        </div>

        <div className="section-title">Chọn ngày</div>
        <div className="date-picker">
          {days.map((d) => (
            <div
              key={d.key}
              className={`date-chip ${selectedDate === d.key ? 'active' : ''}`}
              onClick={() => setSelectedDate(d.key)}
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
        {loadingSlots ? (
          <div style={{ color: '#64748b', padding: 12 }}>Đang tải slot…</div>
        ) : slots.length === 0 ? (
          <div style={{ color: '#94a3b8', padding: 12 }}>Tiệm nghỉ ngày này.</div>
        ) : (
          <div className="slot-grid">
            {slots.map((s) => (
              <button
                key={s.startAt}
                className={`slot-btn ${s.available ? 'available' : 'unavailable'} ${s.isPeak ? 'peak' : ''} ${selectedStartAt === s.startAt ? 'selected' : ''}`}
                disabled={!s.available}
                onClick={() => setSelectedStartAt(s.startAt)}
              >
                {fmtTime(s.startAt)}
              </button>
            ))}
          </div>
        )}

        {selectedStartAt && depositRequired > 0 && (
          <div className="alert alert-warning" style={{ marginTop: 16, padding: 12, background: '#fef3c7', borderRadius: 10, fontSize: 13 }}>
            ⚠️ {isPeak ? 'Cao điểm' : 'Cần cọc'} — cọc {fmtVnd(depositRequired)} để giữ chỗ. Hoàn 100% nếu huỷ trước {service.durationMinutes >= 120 ? 24 : 24}h.
          </div>
        )}
      </div>

      {selectedStartAt && (
        <div className="bottom-bar">
          <div className="price">
            <div className="label">{fmtTime(selectedStartAt)} · {service.durationMinutes} phút</div>
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
