interface BookingRow {
  bookingId: string;
  status: string;
  startAt: string;
  endAt: string;
  customerName: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  isPeakSlot: boolean;
  depositPaidVnd: number;
  depositRequiredVnd: number;
}

interface DayGridProps {
  bookings: BookingRow[];
  staffList: Array<{ id: string; name: string }>;
  date: Date;
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  checked_in: 'bg-purple-100 text-purple-800 border-purple-300',
  in_service: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-300 line-through',
  no_show: 'bg-rose-100 text-rose-800 border-rose-300',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ cọc',
  confirmed: 'Đã xác nhận',
  checked_in: 'Khách đến',
  in_service: 'Đang làm',
  completed: 'Hoàn tất',
  cancelled: 'Đã huỷ',
  no_show: 'Khách bỏ hẹn',
};

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function DayGrid({ bookings, staffList, date }: DayGridProps) {
  const dateLabel = date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  if (bookings.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <p className="text-slate-500 mb-2">Không có lịch hẹn nào hôm nay ({dateLabel})</p>
        <p className="text-slate-400 text-sm">Khách đặt qua Mini App sẽ hiện ở đây realtime, hoặc bấm "Khách walk-in".</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-500">Lịch hôm nay — {dateLabel}</div>
      {staffList.map((staff) => {
        const rows = bookings.filter((b) => b.staffId === staff.id);
        return (
          <div key={staff.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="font-semibold">{staff.name}</div>
              <div className="text-sm text-slate-500">{rows.length} booking</div>
            </div>
            {rows.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">Trống cả ngày</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {rows.map((b) => (
                  <li key={b.bookingId} className="flex items-center gap-4 px-4 py-3">
                    <div className="w-24 font-mono text-sm">
                      {fmtTime(b.startAt)} – {fmtTime(b.endAt)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{b.customerName}</div>
                      <div className="text-xs text-slate-500">{b.serviceName}</div>
                    </div>
                    {b.isPeakSlot && (
                      <span className="rounded-full bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 text-xs font-medium">
                        Cao điểm
                      </span>
                    )}
                    <span
                      className={`rounded-md border px-2 py-1 text-xs font-medium ${
                        STATUS_COLOR[b.status] ?? 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {STATUS_LABEL[b.status] ?? b.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
