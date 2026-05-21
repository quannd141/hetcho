import type { CustomerId, ServiceId, StaffId, TenantId, TransactionId } from '@hetcho/shared';
import type { Service, Tenant, Customer, BookingRepository } from '@hetcho/domain';
import type { RealtimeBroadcaster } from './realtime-broadcaster.js';

export interface TenantRepository {
  findById(id: TenantId): Promise<Tenant | null>;
}
export interface ServiceRepository {
  findById(id: ServiceId, tenantId: TenantId): Promise<Service | null>;
}
export interface CustomerRepository {
  findById(id: CustomerId, tenantId: TenantId): Promise<Customer | null>;
  save(customer: Customer): Promise<void>;
  /** All customers for a tenant. Sufficient at MVP scale; refine later. */
  findByTenant?(tenantId: TenantId): Promise<Customer[]>;
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

export interface AuditEntryView {
  tenantId: TenantId;
  actorType: 'customer' | 'owner' | 'staff' | 'system';
  actorId?: string;
  action: string;
  entity: string;
  entityId: string;
  payload?: Record<string, unknown>;
  createdAt: Date;
}

export interface AuditListFilter {
  tenantId: TenantId;
  action?: string;
  entity?: string;
  from?: Date;
  to?: Date;
  limit?: number;
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
  /** Tenant-scoped query, newest first. Optional to keep older adapters compiling. */
  list?(filter: AuditListFilter): Promise<AuditEntryView[]>;
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
  /** Realtime broadcaster — optional (no-op if absent) */
  broadcaster?: RealtimeBroadcaster;
  /** Allow stub clock in tests */
  now: () => Date;
  /** Generate booking ID */
  generateId: () => string;
}

export type { TransactionId };
