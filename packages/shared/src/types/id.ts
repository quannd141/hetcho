declare const brand: unique symbol;
type Brand<T, B> = T & { [brand]: B };

export type TenantId = Brand<string, 'TenantId'>;
export type UserId = Brand<string, 'UserId'>;
export type BookingId = Brand<string, 'BookingId'>;
export type ServiceId = Brand<string, 'ServiceId'>;
export type StaffId = Brand<string, 'StaffId'>;
export type CustomerId = Brand<string, 'CustomerId'>;
export type PackageId = Brand<string, 'PackageId'>;
export type TransactionId = Brand<string, 'TransactionId'>;
export type ReviewId = Brand<string, 'ReviewId'>;

export const TenantId = (v: string): TenantId => v as TenantId;
export const UserId = (v: string): UserId => v as UserId;
export const BookingId = (v: string): BookingId => v as BookingId;
export const ServiceId = (v: string): ServiceId => v as ServiceId;
export const StaffId = (v: string): StaffId => v as StaffId;
export const CustomerId = (v: string): CustomerId => v as CustomerId;
export const PackageId = (v: string): PackageId => v as PackageId;
export const TransactionId = (v: string): TransactionId => v as TransactionId;
export const ReviewId = (v: string): ReviewId => v as ReviewId;
