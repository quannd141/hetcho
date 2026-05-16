'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  CancelBookingUseCase,
  CheckInBookingUseCase,
  CompleteBookingUseCase,
  MarkNoShowUseCase,
  StartServiceUseCase,
  WalkInBookingUseCase,
} from '@hetcho/application';
import { getContainerReady } from '../container';

export async function walkInBookingAction(formData: FormData): Promise<void> {
  const slug = String(formData.get('slug') ?? '');
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(slug);
  if (!tenant) redirect(`/?error=tenant-not-found`);

  const services = await c.services.findByTenant(tenant.id);
  const staffList = await c.staff.findByTenant(tenant.id);
  if (services.length === 0 || staffList.length === 0) {
    redirect(`/${slug}/dashboard?error=setup-required`);
  }

  const startStr = String(formData.get('startAt') ?? '');
  const startAt = startStr ? new Date(startStr) : new Date(Date.now() + 30 * 60_000);

  const serviceId = String(formData.get('serviceId') ?? services[0].id);
  const staffId = String(formData.get('staffId') ?? staffList[0].id);

  const useCase = new WalkInBookingUseCase(c.bookingDeps);

  try {
    await useCase.execute({
      tenantId: tenant.id,
      serviceId,
      staffId,
      startAt,
      customer: {
        name: String(formData.get('customerName') ?? '').trim(),
        phone: String(formData.get('phone') ?? '').trim(),
      },
    });
    revalidatePath(`/${slug}/dashboard`);
  } catch (err) {
    redirect(`/${slug}/dashboard/walk-in?error=${encodeURIComponent((err as Error).message)}`);
  }

  redirect(`/${slug}/dashboard?walkInCreated=1`);
}

interface BookingTransitionInput {
  slug: string;
  bookingId: string;
  reason?: string;
}

export async function checkInAction(input: BookingTransitionInput): Promise<void> {
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(input.slug);
  if (!tenant) return;
  const useCase = new CheckInBookingUseCase(c.bookingDeps);
  await useCase.execute({ tenantId: tenant.id, bookingId: input.bookingId, actorType: 'owner' });
  revalidatePath(`/${input.slug}/dashboard`);
}

export async function startServiceAction(input: BookingTransitionInput): Promise<void> {
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(input.slug);
  if (!tenant) return;
  const useCase = new StartServiceUseCase(c.bookingDeps);
  await useCase.execute({ tenantId: tenant.id, bookingId: input.bookingId, actorType: 'owner' });
  revalidatePath(`/${input.slug}/dashboard`);
}

export async function completeBookingAction(input: BookingTransitionInput & { finalPriceVnd?: number }): Promise<void> {
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(input.slug);
  if (!tenant) return;

  let finalPriceVnd = input.finalPriceVnd;
  if (finalPriceVnd === undefined) {
    const booking = await c.bookings.findById(input.bookingId as never);
    if (booking) {
      const props = booking.toJSON();
      const service = await c.services.findById(props.serviceId, tenant.id);
      finalPriceVnd = service?.priceVnd ?? 0;
    } else {
      finalPriceVnd = 0;
    }
  }

  const useCase = new CompleteBookingUseCase(c.bookingDeps);
  await useCase.execute({
    tenantId: tenant.id,
    bookingId: input.bookingId,
    actorType: 'owner',
    finalPriceVnd,
  });
  revalidatePath(`/${input.slug}/dashboard`);
}

export async function cancelBookingAction(input: BookingTransitionInput): Promise<void> {
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(input.slug);
  if (!tenant) return;
  const useCase = new CancelBookingUseCase(c.bookingDeps);
  await useCase.execute({
    tenantId: tenant.id,
    bookingId: input.bookingId,
    actorType: 'owner',
    reason: input.reason ?? 'owner-cancel',
  });
  revalidatePath(`/${input.slug}/dashboard`);
}

export async function markNoShowAction(input: BookingTransitionInput): Promise<void> {
  const c = await getContainerReady();
  const tenant = await c.tenants.findBySlug(input.slug);
  if (!tenant) return;
  const useCase = new MarkNoShowUseCase(c.bookingDeps);
  await useCase.execute({ tenantId: tenant.id, bookingId: input.bookingId, actorType: 'owner' });
  revalidatePath(`/${input.slug}/dashboard`);
}
