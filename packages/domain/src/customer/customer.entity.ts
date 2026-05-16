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
}

/**
 * Tier rule: ≥10 bookings → CIP. ≥50 bookings + 30tr spend → VIP.
 */
export class Customer {
  private constructor(private props: CustomerProps) {}

  static create(props: CustomerProps): Customer {
    return new Customer(props);
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

  toJSON(): CustomerProps {
    return { ...this.props };
  }
}
