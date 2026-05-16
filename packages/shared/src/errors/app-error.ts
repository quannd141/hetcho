import type { ErrorCode } from './error-codes.js';
import { ErrorCode as Codes } from './error-codes.js';

export interface AppErrorOptions {
  code: ErrorCode;
  message: string;
  httpStatus?: number;
  details?: Record<string, unknown>;
  cause?: unknown;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly httpStatus: number;
  public readonly details?: Record<string, unknown>;

  constructor(opts: AppErrorOptions) {
    super(opts.message, { cause: opts.cause });
    this.name = this.constructor.name;
    this.code = opts.code;
    this.httpStatus = opts.httpStatus ?? 500;
    this.details = opts.details;
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON(): { code: ErrorCode; message: string; details?: Record<string, unknown> } {
    return {
      code: this.code,
      message: this.message,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ code: Codes.VALIDATION, message, httpStatus: 400, details });
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ code: Codes.NOT_FOUND, message, httpStatus: 404, details });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ code: Codes.CONFLICT, message, httpStatus: 409, details });
  }
}

export class BookingConflictError extends AppError {
  constructor(details: { tenantId: string; staffId: string; startAt: Date; endAt: Date }) {
    super({
      code: Codes.BOOKING_CONFLICT,
      message: 'Slot vừa bị đặt, vui lòng chọn slot khác',
      httpStatus: 409,
      details: { ...details, startAt: details.startAt.toISOString(), endAt: details.endAt.toISOString() },
    });
  }
}

export class PaymentFailedError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super({ code: Codes.PAYMENT_FAILED, message, httpStatus: 402, details });
  }
}
