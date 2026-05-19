import { type TenantId, tzHHMM, tzWeekday } from '@hetcho/shared';
import type { WorkingHours } from './working-hours.vo.js';

export type TenantType = 'salon_toc' | 'spa_skincare' | 'nail' | 'goi_dau' | 'barber' | 'massage' | 'other';

export interface PeakWindow {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  from: string;
  to: string;
}

export interface TenantProps {
  id: TenantId;
  slug: string;
  name: string;
  type: TenantType;
  workingHours: WorkingHours;
  peakWindows: PeakWindow[];
  slotMinutes: number;
  timezone: string;
  cancelPolicy: { refundFullHoursBefore: number; finePercent: number };
}

export class Tenant {
  private constructor(private props: TenantProps) {}

  static create(props: TenantProps): Tenant {
    return new Tenant(props);
  }

  get id(): TenantId {
    return this.props.id;
  }
  get cancelPolicy(): TenantProps['cancelPolicy'] {
    return this.props.cancelPolicy;
  }
  get timezone(): string {
    return this.props.timezone;
  }

  isPeakSlot(at: Date): boolean {
    const day = tzWeekday(at, this.props.timezone);
    const hhmm = tzHHMM(at, this.props.timezone);
    return this.props.peakWindows.some((w) => w.day === day && hhmm >= w.from && hhmm < w.to);
  }

  toJSON(): TenantProps {
    return { ...this.props };
  }
}
