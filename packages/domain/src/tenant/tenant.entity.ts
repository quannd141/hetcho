import type { TenantId } from '@hetcho/shared';
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

const DAYS_OF_WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

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

  isPeakSlot(at: Date): boolean {
    const dayIdx = at.getDay();
    const day = DAYS_OF_WEEK[dayIdx];
    if (!day) return false;
    const hhmm = `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`;
    return this.props.peakWindows.some((w) => w.day === day && hhmm >= w.from && hhmm < w.to);
  }

  toJSON(): TenantProps {
    return { ...this.props };
  }
}
