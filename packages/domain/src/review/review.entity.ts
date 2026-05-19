import { AppError, ErrorCode, type BookingId, type CustomerId, type ReviewId, type TenantId } from '@hetcho/shared';

export interface ReviewProps {
  id: ReviewId;
  tenantId: TenantId;
  bookingId: BookingId;
  customerId: CustomerId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const MAX_COMMENT_LENGTH = 500;

export class Review {
  private constructor(private readonly props: ReviewProps) {}

  static create(props: ReviewProps): Review {
    if (!Number.isInteger(props.rating) || props.rating < 1 || props.rating > 5) {
      throw new AppError({
        code: ErrorCode.VALIDATION,
        message: 'rating must be integer 1-5',
        httpStatus: 400,
      });
    }
    if (props.comment.length > MAX_COMMENT_LENGTH) {
      throw new AppError({
        code: ErrorCode.VALIDATION,
        message: `comment exceeds ${MAX_COMMENT_LENGTH} chars`,
        httpStatus: 400,
      });
    }
    return new Review({ ...props, comment: props.comment.trim() });
  }

  get id(): ReviewId {
    return this.props.id;
  }
  get rating(): number {
    return this.props.rating;
  }
  get bookingId(): BookingId {
    return this.props.bookingId;
  }
  get tenantId(): TenantId {
    return this.props.tenantId;
  }

  toJSON(): ReviewProps {
    return { ...this.props };
  }
}
