import 'server-only';

export interface Review {
  bookingId: string;
  tenantSlug: string;
  customerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __hetcho_reviews: Map<string, Review> | undefined;
}

function store(): Map<string, Review> {
  if (!globalThis.__hetcho_reviews) {
    globalThis.__hetcho_reviews = new Map();
  }
  return globalThis.__hetcho_reviews;
}

export function saveReview(review: Review): void {
  store().set(review.bookingId, review);
}

export function getReview(bookingId: string): Review | null {
  return store().get(bookingId) ?? null;
}

export function listReviewsByTenant(tenantSlug: string): Review[] {
  return [...store().values()].filter((r) => r.tenantSlug === tenantSlug);
}
