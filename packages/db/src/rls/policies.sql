-- ============================================================================
-- HếtChờ — Row-Level Security Policies
-- ============================================================================
-- Apply sau khi drizzle-kit migrate generated schema.
-- Mọi bảng tenant-scoped enforce: tenant_id = auth.jwt() ->> 'tenant_id'.
-- Super-admin dùng service_role bypass.
-- ----------------------------------------------------------------------------

-- Helper: lấy tenant_id từ JWT claim
CREATE OR REPLACE FUNCTION auth.current_tenant_id() RETURNS uuid AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json ->> 'tenant_id', '')::uuid
$$ LANGUAGE sql STABLE;

-- Enable RLS trên các bảng tenant-scoped
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Tenants: chủ tiệm chỉ thấy tenant của mình
CREATE POLICY tenants_own ON tenants
  FOR ALL USING (id = auth.current_tenant_id());

-- Generic tenant-scoped policy template
DO $$
DECLARE
  tbl text;
  tenant_tables text[] := ARRAY[
    'users', 'services', 'staff', 'customers', 'bookings',
    'packages', 'customer_packages', 'package_usages',
    'transactions', 'notifications', 'audit_events'
  ];
BEGIN
  FOREACH tbl IN ARRAY tenant_tables LOOP
    EXECUTE format(
      'CREATE POLICY %I_tenant_isolation ON %I FOR ALL USING (tenant_id = auth.current_tenant_id())',
      tbl, tbl
    );
  END LOOP;
END $$;

-- Audit events: SELECT cho tenant, INSERT cho mọi authenticated user trong tenant,
-- KHÔNG UPDATE/DELETE (immutable log)
CREATE POLICY audit_events_no_update ON audit_events
  FOR UPDATE USING (false);
CREATE POLICY audit_events_no_delete ON audit_events
  FOR DELETE USING (false);

-- staff_services không có tenant_id trực tiếp → join qua staff
CREATE POLICY staff_services_via_staff ON staff_services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM staff WHERE staff.id = staff_id AND staff.tenant_id = auth.current_tenant_id())
  );

-- ============================================================================
-- TEST CROSS-TENANT ISOLATION (chạy sau migration để verify):
-- ============================================================================
-- 1. SET request.jwt.claims = '{"tenant_id":"<tenant_A_uuid>"}';
-- 2. SELECT count(*) FROM bookings;  -- chỉ thấy booking của A
-- 3. SET request.jwt.claims = '{"tenant_id":"<tenant_B_uuid>"}';
-- 4. SELECT count(*) FROM bookings;  -- chỉ thấy booking của B
-- 5. Cross-tenant INSERT phải reject.
