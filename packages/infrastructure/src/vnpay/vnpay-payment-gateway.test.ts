import { describe, it, expect } from 'vitest';
import { TenantId } from '@hetcho/shared';
import { VnpayPaymentGateway, formatVnpayDate } from './vnpay-payment-gateway.js';
import { verifyVnpaySignature } from './vnpay-signature.js';

const TENANT = '11111111-1111-1111-1111-111111111111';

function makeGateway() {
  return new VnpayPaymentGateway({
    tmnCode: 'TEST01',
    hashSecret: 'TESTSECRETKEY123',
    payUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: 'https://hetcho.vn/return',
  });
}

describe('VnpayPaymentGateway', () => {
  it('throws when tmnCode / hashSecret / payUrl missing', () => {
    expect(() => new VnpayPaymentGateway({ tmnCode: '', hashSecret: 'x', payUrl: 'y', returnUrl: 'z' })).toThrow();
    expect(() => new VnpayPaymentGateway({ tmnCode: 'x', hashSecret: '', payUrl: 'y', returnUrl: 'z' })).toThrow();
    expect(() => new VnpayPaymentGateway({ tmnCode: 'x', hashSecret: 'y', payUrl: '', returnUrl: 'z' })).toThrow();
  });

  it('createDeposit returns paymentUrl + gatewayTxnId', async () => {
    const gw = makeGateway();
    const result = await gw.createDeposit({
      tenantId: TenantId(TENANT),
      bookingId: 'BOOK-001',
      amountVnd: 50_000,
      returnUrl: 'https://hetcho.vn/return',
      customerPhoneMasked: '0***1234',
    });
    expect(result.paymentUrl).toMatch(/^https:\/\/sandbox\.vnpayment\.vn/);
    expect(result.gatewayTxnId).toContain('BOOK-001');
    expect(result.paymentUrl).toContain('vnp_SecureHash=');
    expect(result.paymentUrl).toContain('vnp_Amount=5000000'); // ×100
  });

  it('signature in the URL verifies back correctly', async () => {
    const gw = makeGateway();
    const { paymentUrl } = await gw.createDeposit({
      tenantId: TenantId(TENANT),
      bookingId: 'BOOK-002',
      amountVnd: 100_000,
      returnUrl: 'https://hetcho.vn/return',
      customerPhoneMasked: '0***5678',
    });
    const params = parseParams(paymentUrl);
    expect(verifyVnpaySignature(params, 'TESTSECRETKEY123')).toBe(true);
  });

  it('tampered URL fails verification', async () => {
    const gw = makeGateway();
    const { paymentUrl } = await gw.createDeposit({
      tenantId: TenantId(TENANT),
      bookingId: 'BOOK-003',
      amountVnd: 100_000,
      returnUrl: 'https://hetcho.vn/return',
      customerPhoneMasked: '0***0000',
    });
    const params = parseParams(paymentUrl);
    params.vnp_Amount = '99999900'; // attacker bump
    expect(verifyVnpaySignature(params, 'TESTSECRETKEY123')).toBe(false);
  });
});

describe('formatVnpayDate', () => {
  it('formats UTC date as Asia/Ho_Chi_Minh yyyyMMddHHmmss', () => {
    // 2026-07-01T03:00:00Z = 10:00:00 +07
    expect(formatVnpayDate(new Date('2026-07-01T03:00:00Z'))).toBe('20260701100000');
  });

  it('handles midnight rollover at 17:00 UTC = 00:00 +07 next day', () => {
    expect(formatVnpayDate(new Date('2026-06-30T17:00:00Z'))).toBe('20260701000000');
  });
});

function parseParams(url: string): Record<string, string> {
  const q = url.split('?')[1] ?? '';
  const out: Record<string, string> = {};
  for (const pair of q.split('&')) {
    const [k, v = ''] = pair.split('=');
    // VNPay form-encoding: spaces are '+'; decode accordingly.
    out[k] = decodeURIComponent(v.replace(/\+/g, ' '));
  }
  return out;
}
