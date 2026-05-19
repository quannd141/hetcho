import { tzHHMM, tzWeekday } from '@hetcho/shared';

export type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DayHours {
  open: string;
  close: string;
}

export type WorkingHours = Partial<Record<Day, DayHours | null>>;

export function isWithinWorkingHours(
  workingHours: WorkingHours,
  at: Date,
  durationMinutes: number,
  timeZone: string,
): boolean {
  const day = tzWeekday(at, timeZone);
  const hours = workingHours[day];
  if (!hours) return false;

  const endTime = new Date(at.getTime() + durationMinutes * 60_000);
  const startHHMM = tzHHMM(at, timeZone);
  const endHHMM = tzHHMM(endTime, timeZone);

  return startHHMM >= hours.open && endHHMM <= hours.close;
}
