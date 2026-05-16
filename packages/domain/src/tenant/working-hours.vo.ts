export type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DayHours {
  open: string;
  close: string;
}

export type WorkingHours = Partial<Record<Day, DayHours | null>>;

const DAYS: readonly Day[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function isWithinWorkingHours(workingHours: WorkingHours, at: Date, durationMinutes: number): boolean {
  const day = DAYS[at.getDay()];
  if (!day) return false;
  const hours = workingHours[day];
  if (!hours) return false;

  const endTime = new Date(at.getTime() + durationMinutes * 60_000);
  const dayStr = `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`;
  const endStr = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;

  return dayStr >= hours.open && endStr <= hours.close;
}
