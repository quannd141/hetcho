'use client';

import Link from 'next/link';

interface DayWeekToggleProps {
  slug: string;
  view: 'day' | 'week';
}

export function DayWeekToggle({ slug, view }: DayWeekToggleProps) {
  return (
    <div className="inline-flex rounded-md border border-slate-200 bg-white overflow-hidden">
      <Link
        href={`/${slug}/dashboard?view=day`}
        className={`px-4 py-2 text-sm font-medium ${
          view === 'day' ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-50'
        }`}
      >
        Ngày
      </Link>
      <Link
        href={`/${slug}/dashboard?view=week`}
        className={`px-4 py-2 text-sm font-medium ${
          view === 'week' ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-50'
        }`}
      >
        Tuần
      </Link>
    </div>
  );
}
