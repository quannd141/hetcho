import { describe, it, expect } from 'vitest';
import { NotificationTemplateId, TenantId, ValidationError } from '@hetcho/shared';
import { NotificationTemplate } from './notification-template.entity.js';

const TENANT = TenantId('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
const TPL = NotificationTemplateId('11111111-1111-1111-1111-111111111111');

function make(overrides: Partial<{ body: string; name: string }> = {}): NotificationTemplate {
  return NotificationTemplate.create({
    id: TPL,
    tenantId: TENANT,
    trigger: 'customer.recovery_30d',
    channel: 'zns',
    name: overrides.name ?? 'Recovery 30d',
    body: overrides.body ?? 'Chào {{customer.name}}, lâu rồi không gặp!',
    createdAt: new Date('2026-05-01T00:00:00Z'),
  });
}

describe('NotificationTemplate.create', () => {
  it('should trim name and body', () => {
    const t = make({ name: '  Recovery 30d  ', body: '  hi  ' });
    expect(t.name).toBe('Recovery 30d');
    expect(t.body).toBe('hi');
  });

  it('should reject empty name', () => {
    expect(() => make({ name: '   ' })).toThrow(ValidationError);
  });

  it('should reject empty body', () => {
    expect(() => make({ body: '   ' })).toThrow(ValidationError);
  });

  it('should reject body longer than 1000 chars', () => {
    expect(() => make({ body: 'a'.repeat(1001) })).toThrow(ValidationError);
  });

  it('should default isActive to true and stamp createdAt/updatedAt', () => {
    const t = make();
    expect(t.isActive).toBe(true);
    expect(t.createdAt).toEqual(t.updatedAt);
  });
});

describe('NotificationTemplate.placeholders', () => {
  it('should extract distinct placeholder names', () => {
    const t = make({
      body: 'Hi {{customer.name}}, your {{service.name}} at {{tenant.name}} - reminder for {{customer.name}}.',
    });
    expect(t.placeholders().sort()).toEqual(['customer.name', 'service.name', 'tenant.name']);
  });

  it('should handle template with no placeholders', () => {
    const t = make({ body: 'plain text body' });
    expect(t.placeholders()).toEqual([]);
  });
});

describe('NotificationTemplate.render', () => {
  it('should interpolate top-level placeholders', () => {
    const t = make({ body: 'Hi {{name}}!' });
    expect(t.render({ name: 'Quân' })).toBe('Hi Quân!');
  });

  it('should walk nested object paths', () => {
    const t = make({ body: 'Hi {{customer.name}} at {{tenant.name}}' });
    expect(t.render({ customer: { name: 'Quân' }, tenant: { name: 'Salon Hằng' } })).toBe(
      'Hi Quân at Salon Hằng',
    );
  });

  it('should replace missing placeholders with empty string', () => {
    const t = make({ body: 'Hi {{customer.name}}!' });
    expect(t.render({})).toBe('Hi !');
  });

  it('should tolerate whitespace inside placeholder braces', () => {
    const t = make({ body: 'Hi {{  customer.name  }}!' });
    expect(t.render({ customer: { name: 'Quân' } })).toBe('Hi Quân!');
  });

  it('should coerce non-string values to string', () => {
    const t = make({ body: 'Còn {{remaining}} buổi' });
    expect(t.render({ remaining: 4 })).toBe('Còn 4 buổi');
  });
});

describe('NotificationTemplate mutations', () => {
  it('updateBody should change body and bump updatedAt', () => {
    const t = make();
    const later = new Date('2026-05-02T00:00:00Z');
    t.updateBody('new body', later);
    expect(t.body).toBe('new body');
    expect(t.updatedAt).toEqual(later);
  });

  it('updateBody should reject empty', () => {
    const t = make();
    expect(() => t.updateBody('   ', new Date())).toThrow(ValidationError);
  });

  it('deactivate then activate should toggle isActive and bump updatedAt', () => {
    const t = make();
    const at1 = new Date('2026-05-02T00:00:00Z');
    t.deactivate(at1);
    expect(t.isActive).toBe(false);
    expect(t.updatedAt).toEqual(at1);

    const at2 = new Date('2026-05-03T00:00:00Z');
    t.activate(at2);
    expect(t.isActive).toBe(true);
    expect(t.updatedAt).toEqual(at2);
  });

  it('rename should change name and bump updatedAt', () => {
    const t = make();
    const at = new Date('2026-05-02T00:00:00Z');
    t.rename('New name', at);
    expect(t.name).toBe('New name');
    expect(t.updatedAt).toEqual(at);
  });
});
