const STEPS = [
  { id: 1, label: 'Thông tin tiệm' },
  { id: 2, label: 'Dịch vụ đầu tiên' },
  { id: 3, label: 'Thợ / KTV' },
  { id: 4, label: 'Giờ làm + cao điểm' },
  { id: 5, label: 'Kết nối Zalo OA' },
];

export function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2 mb-8 overflow-x-auto">
      {STEPS.map((s, idx) => {
        const status = s.id < current ? 'done' : s.id === current ? 'current' : 'pending';
        return (
          <li key={s.id} className="flex items-center gap-2 flex-shrink-0">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                status === 'current'
                  ? 'bg-brand-600 text-white'
                  : status === 'done'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {status === 'done' ? '✓' : s.id}
            </div>
            <span
              className={`text-sm font-medium ${
                status === 'pending' ? 'text-slate-400' : 'text-slate-700'
              }`}
            >
              {s.label}
            </span>
            {idx < STEPS.length - 1 && <span className="text-slate-300 ml-1">›</span>}
          </li>
        );
      })}
    </ol>
  );
}
