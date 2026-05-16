import { Customer, Service, Tenant } from '@hetcho/domain';
import { CustomerId, ServiceId, StaffId, TenantId } from '@hetcho/shared';
import type { InMemoryCustomerRepository } from '../mock/in-memory-customer-repository.js';
import type { InMemoryServiceRepository } from '../mock/in-memory-service-repository.js';
import type { InMemoryStaffRepository } from '../mock/in-memory-staff-repository.js';
import type { InMemoryTenantRepository } from '../mock/in-memory-tenant-repository.js';

/**
 * Seed 3 demo tenants vào in-memory repos (cho local dev + integration tests).
 * Personas khớp với BA Discovery synthetic interviews.
 */
export async function seedDemoTenants(repos: {
  tenants: InMemoryTenantRepository;
  services: InMemoryServiceRepository;
  staff: InMemoryStaffRepository;
  customers: InMemoryCustomerRepository;
}): Promise<{
  salonHang: { tenantId: TenantId; serviceIds: ServiceId[]; staffIds: StaffId[] };
  spaMai: { tenantId: TenantId; serviceIds: ServiceId[]; staffIds: StaffId[] };
  nailLinh: { tenantId: TenantId; serviceIds: ServiceId[]; staffIds: StaffId[] };
}> {
  const salonHang = await seedSalonHang(repos);
  const spaMai = await seedSpaMai(repos);
  const nailLinh = await seedNailLinh(repos);
  return { salonHang, spaMai, nailLinh };
}

async function seedSalonHang(repos: SeedRepos) {
  const tenantId = TenantId('11111111-1111-1111-1111-111111111111');
  const tenant = Tenant.create({
    id: tenantId,
    slug: 'salon-hang',
    name: 'Salon Hằng Hair',
    type: 'salon_toc',
    workingHours: openAll('08:00', '22:00'),
    peakWindows: [
      { day: 'sat', from: '14:00', to: '22:00' },
      { day: 'sun', from: '10:00', to: '22:00' },
    ],
    slotMinutes: 30,
    timezone: 'Asia/Ho_Chi_Minh',
    cancelPolicy: { refundFullHoursBefore: 24, finePercent: 50 },
  });
  await repos.tenants.save(tenant);

  const sv1 = ServiceId('11111111-1111-1111-1111-aaaa11111111');
  const sv2 = ServiceId('11111111-1111-1111-1111-aaaa11111112');
  const sv3 = ServiceId('11111111-1111-1111-1111-aaaa11111113');
  await repos.services.save(
    Service.create({
      id: sv1,
      tenantId,
      name: 'Cắt + Gội',
      durationMinutes: 60,
      priceVnd: 250_000,
      depositNormalVnd: 0,
      depositPeakVnd: 50_000,
      category: 'Tóc',
      isActive: true,
    }),
  );
  await repos.services.save(
    Service.create({
      id: sv2,
      tenantId,
      name: 'Nhuộm tóc',
      durationMinutes: 180,
      priceVnd: 800_000,
      depositNormalVnd: 100_000,
      depositPeakVnd: 200_000,
      category: 'Tóc',
      isActive: true,
    }),
  );
  await repos.services.save(
    Service.create({
      id: sv3,
      tenantId,
      name: 'Uốn duỗi',
      durationMinutes: 240,
      priceVnd: 1_200_000,
      depositNormalVnd: 200_000,
      depositPeakVnd: 300_000,
      category: 'Tóc',
      isActive: true,
    }),
  );

  const st1 = StaffId('11111111-1111-1111-1111-bbbb11111111');
  const st2 = StaffId('11111111-1111-1111-1111-bbbb11111112');
  await repos.staff.save({
    id: st1,
    tenantId,
    name: 'Hằng (chủ)',
    serviceIds: [sv1, sv2, sv3],
    workingHours: openAll('08:00', '22:00'),
    isActive: true,
  });
  await repos.staff.save({
    id: st2,
    tenantId,
    name: 'Anh Tuấn',
    serviceIds: [sv1, sv2],
    workingHours: openAll('09:00', '21:00'),
    isActive: true,
  });

  return { tenantId, serviceIds: [sv1, sv2, sv3], staffIds: [st1, st2] };
}

async function seedSpaMai(repos: SeedRepos) {
  const tenantId = TenantId('22222222-2222-2222-2222-222222222222');
  const tenant = Tenant.create({
    id: tenantId,
    slug: 'mai-spa',
    name: 'Mai Skin Spa',
    type: 'spa_skincare',
    workingHours: {
      mon: { open: '09:00', close: '21:00' },
      tue: { open: '09:00', close: '21:00' },
      wed: { open: '09:00', close: '21:00' },
      thu: { open: '09:00', close: '21:00' },
      fri: { open: '09:00', close: '21:00' },
      sat: { open: '09:00', close: '21:00' },
      sun: null,
    },
    peakWindows: [{ day: 'sat', from: '14:00', to: '21:00' }],
    slotMinutes: 60,
    timezone: 'Asia/Ho_Chi_Minh',
    cancelPolicy: { refundFullHoursBefore: 48, finePercent: 100 },
  });
  await repos.tenants.save(tenant);

  const sv1 = ServiceId('22222222-2222-2222-2222-aaaa22222221');
  const sv2 = ServiceId('22222222-2222-2222-2222-aaaa22222222');
  await repos.services.save(
    Service.create({
      id: sv1,
      tenantId,
      name: 'Treatment trắng da',
      durationMinutes: 90,
      priceVnd: 800_000,
      depositNormalVnd: 100_000,
      depositPeakVnd: 200_000,
      category: 'Skincare',
      isActive: true,
    }),
  );
  await repos.services.save(
    Service.create({
      id: sv2,
      tenantId,
      name: 'Massage trị liệu',
      durationMinutes: 60,
      priceVnd: 500_000,
      depositNormalVnd: 100_000,
      depositPeakVnd: 200_000,
      category: 'Massage',
      isActive: true,
    }),
  );

  const st1 = StaffId('22222222-2222-2222-2222-bbbb22222221');
  await repos.staff.save({
    id: st1,
    tenantId,
    name: 'KTV Mai',
    serviceIds: [sv1, sv2],
    workingHours: {
      mon: { open: '09:00', close: '21:00' },
      tue: { open: '09:00', close: '21:00' },
      wed: { open: '09:00', close: '21:00' },
      thu: { open: '09:00', close: '21:00' },
      fri: { open: '09:00', close: '21:00' },
      sat: { open: '09:00', close: '21:00' },
      sun: null,
    },
    isActive: true,
  });

  return { tenantId, serviceIds: [sv1, sv2], staffIds: [st1] };
}

async function seedNailLinh(repos: SeedRepos) {
  const tenantId = TenantId('33333333-3333-3333-3333-333333333333');
  const tenant = Tenant.create({
    id: tenantId,
    slug: 'linh-nail',
    name: 'Linh Nail Studio',
    type: 'nail',
    workingHours: openAll('09:00', '22:00'),
    peakWindows: [
      { day: 'sat', from: '14:00', to: '22:00' },
      { day: 'sun', from: '10:00', to: '22:00' },
    ],
    slotMinutes: 30,
    timezone: 'Asia/Ho_Chi_Minh',
    cancelPolicy: { refundFullHoursBefore: 12, finePercent: 30 },
  });
  await repos.tenants.save(tenant);

  const sv1 = ServiceId('33333333-3333-3333-3333-aaaa33333331');
  const sv2 = ServiceId('33333333-3333-3333-3333-aaaa33333332');
  await repos.services.save(
    Service.create({
      id: sv1,
      tenantId,
      name: 'Nail gel cơ bản',
      durationMinutes: 60,
      priceVnd: 250_000,
      depositNormalVnd: 0,
      depositPeakVnd: 50_000,
      category: 'Nail',
      isActive: true,
    }),
  );
  await repos.services.save(
    Service.create({
      id: sv2,
      tenantId,
      name: 'Nail vẽ thiết kế',
      durationMinutes: 120,
      priceVnd: 500_000,
      depositNormalVnd: 50_000,
      depositPeakVnd: 100_000,
      category: 'Nail',
      isActive: true,
    }),
  );

  const st1 = StaffId('33333333-3333-3333-3333-bbbb33333331');
  const st2 = StaffId('33333333-3333-3333-3333-bbbb33333332');
  const st3 = StaffId('33333333-3333-3333-3333-bbbb33333333');
  await repos.staff.save({ id: st1, tenantId, name: 'Linh (chủ)', serviceIds: [sv1, sv2], workingHours: openAll('09:00', '22:00'), isActive: true });
  await repos.staff.save({ id: st2, tenantId, name: 'Em Thanh', serviceIds: [sv1, sv2], workingHours: openAll('09:00', '22:00'), isActive: true });
  await repos.staff.save({ id: st3, tenantId, name: 'Em Vy', serviceIds: [sv1], workingHours: openAll('09:00', '22:00'), isActive: true });

  // Seed some sample customers (cross-tier)
  await repos.customers.save(
    Customer.create({
      id: CustomerId('33333333-3333-3333-3333-cccc33333331'),
      tenantId,
      name: 'Khách quen Lan',
      phoneHash: 'hash:0901234567',
      phoneMasked: '09***4567',
      zaloId: 'zalo-lan',
      tier: 'cip',
      lifetimeSpendVnd: 8_000_000,
      totalBookings: 15,
    }),
  );

  return { tenantId, serviceIds: [sv1, sv2], staffIds: [st1, st2, st3] };
}

type SeedRepos = Parameters<typeof seedDemoTenants>[0];

function openAll(open: string, close: string) {
  return {
    mon: { open, close },
    tue: { open, close },
    wed: { open, close },
    thu: { open, close },
    fri: { open, close },
    sat: { open, close },
    sun: { open, close },
  };
}
