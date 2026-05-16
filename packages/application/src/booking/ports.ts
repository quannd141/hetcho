import type { CustomerId, ServiceId, StaffId, TenantId, TransactionId } from '@hetcho/shared';
import type { Service, Tenant, Customer, BookingRepository } from '@hetcho/domain';

export interface TenantRepository {
  findById(id: TenantId): Promise<Tenant | null>;
}
export interface ServiceRepository {
  findById(id: ServiceId, tenantId: TenantId): Promise<Service | null>;
}
export interface CustomerRepository {
  findById(id: CustomerId, tenantId: TenantId): Promise<Customer | null>;
  save(customer: Customer): Promise<void>;
}

export interface PaymentGateway {
  createDeposit(input: {
    tenantId: TenantId;
    bookingId: string;
    amountVnd: number;
    returnUrl: string;
    customerPhoneMasked: string;
  }): Promise<{ paymentUrl: string; gatewayTxnId: string }>;
}

export interface NotificationSender {
  sendBookingConfirmation(input: { tenantId: TenantId; customerId: CustomerId; bookingId: string }): Promise<void>;
  sendBookingCancellation(input: {
    tenantId: TenantId;
    customerId: CustomerId;
    bookingId: string;
    refundAmountVnd: number;
  }): Promise<void>;
}

export interface AuditLogger {
  log(input: {
    tenantId: TenantId;
    actorType: 'customer' | 'owner' | 'staff' | 'system';
    actorId?: string;
    action: string;
    entity: string;
    entityId: string;
    payload?: Record<string, unknown>;
  }): Promise<void>;
}

export interface UnitOfWork {
  run<T>(work: (ctx: {
    bookings: BookingRepository;
    customers: CustomerRepository;
    audit: AuditLogger;
  }) => Promise<T>): Promise<T>;
}

export interface BookingDependencies {
  tenants: TenantRepository;
  services: ServiceRepository;
  customers: CustomerRepository;
  bookings: BookingRepository;
  unitOfWork: UnitOfWork;
  payment: PaymentGateway;
  notification: NotificationSender;
  audit: AuditLogger;
  /** Allow stub clock in tests */
  now: () => Date;
  /** Generate booking ID */
  generateId: () => string;
}

export type { TransactionId };
