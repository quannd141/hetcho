import type { CustomerId, TenantId } from '@hetcho/shared';

export type CustomerTier = 'normal' | 'cip' | 'vip';

export interface CustomerProps {
  id: CustomerId;
  tenantId: TenantId;
  name: string;
  phoneHash: string;
  phoneMasked: string;
  zaloId: string | null;
  tier: CustomerTier;
  lifetimeSpendVnd: number;
  totalBookings: number;
  lastVisitAt: Date | null;
}

/**
 * Tier rule: ≥10 bookings → CIP. ≥50 bookings + 30tr spend → VIP.
 */
export class Customer {
  private constructor(private props: CustomerProps) {}

  static create(props: Omit<CustomerProps, 'lastVisitAt'> & { lastVisitAt?: Date | null }): Customer {
    return new Customer({ ...props, lastVisitAt: props.lastVisitAt ?? null });
  }

  get id(): CustomerId {
    return this.props.id;
  }
  get tier(): CustomerTier {
    return this.props.tier;
  }
  get totalBookings(): number {
    return this.props.totalBookings;
  }
  get lifetimeSpendVnd(): number {
    return this.props.lifetimeSpendVnd;
  }
  get lastVisitAt(): Date | null {
    return this.props.lastVisitAt;
  }

  static computeTier(totalBookings: number, lifetimeSpendVnd: number): CustomerTier {
    if (totalBookings >= 50 && lifetimeSpendVnd >= 30_000_000) return 'vip';
    if (totalBookings >= 10) return 'cip';
    return 'normal';
  }

  recordBooking(amountVnd: number): void {
    this.props.totalBookings += 1;
    this.props.lifetimeSpendVnd += amountVnd;
    this.props.tier = Customer.computeTier(this.props.totalBookings, this.props.lifetimeSpendVnd);
  }

  /**
   * Record a completed visit. Advances lastVisitAt monotonically — passing
   * an earlier timestamp is ignored (idempotent for out-of-order completion
   * events).
   */
  recordVisit(at: Date): void {
    if (this.props.lastVisitAt === null || at.getTime() > this.props.lastVisitAt.getTime()) {
      this.props.lastVisitAt = at;
    }
  }

  toJSON(): CustomerProps {
    return { ...this.props };
  }
}
