export type WeekdayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

const WEEKDAY_MAP: Record<string, WeekdayKey> = {
  Sun: 'sun',
  Mon: 'mon',
  Tue: 'tue',
  Wed: 'wed',
  Thu: 'thu',
  Fri: 'fri',
  Sat: 'sat',
};

interface TzParts {
  weekday: WeekdayKey;
  hour: number;
  minute: number;
  year: number;
  month: number;
  day: number;
}

export function getTzParts(date: Date, timeZone: string): TzParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts = fmt.formatToParts(date);
  const get = (t: string): string => parts.find((p) => p.type === t)?.value ?? '';
  const weekday = WEEKDAY_MAP[get('weekday')] ?? 'sun';
  return {
    weekday,
    hour: parseInt(get('hour'), 10),
    minute: parseInt(get('minute'), 10),
    year: parseInt(get('year'), 10),
    month: parseInt(get('month'), 10),
    day: parseInt(get('day'), 10),
  };
}

export function tzHHMM(date: Date, timeZone: string): string {
  const p = getTzParts(date, timeZone);
  return `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
}

export function tzWeekday(date: Date, timeZone: string): WeekdayKey {
  return getTzParts(date, timeZone).weekday;
}

export function tzYMD(date: Date, timeZone: string): string {
  const p = getTzParts(date, timeZone);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

export function tzMidnightUtc(ymd: string, timeZone: string): Date {
  const [yearStr, monthStr, dayStr] = ymd.split('-');
  const year = parseInt(yearStr ?? '', 10);
  const month = parseInt(monthStr ?? '', 10);
  const day = parseInt(dayStr ?? '', 10);
  const guess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const guessParts = getTzParts(guess, timeZone);
  const diffHours = guessParts.hour + (guessParts.day !== day ? (guessParts.day > day ? 24 : -24) : 0);
  return new Date(guess.getTime() - diffHours * 3_600_000 - guessParts.minute * 60_000);
}

export function tzHHMMToUtc(ymd: string, hhmm: string, timeZone: string): Date {
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr ?? '0', 10);
  const m = parseInt(mStr ?? '0', 10);
  const midnight = tzMidnightUtc(ymd, timeZone);
  return new Date(midnight.getTime() + (h * 60 + m) * 60_000);
}
