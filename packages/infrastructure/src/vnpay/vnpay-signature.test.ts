import { describe, it, expect } from 'vitest';
import {
  buildSignString,
  signVnpayParams,
  verifyVnpaySignature,
} from './vnpay-signature.js';

const SECRET = 'TESTSECRETKEY123';

function basicParams() {
  return {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: 'TEST01',
    vnp_Amount: '5000000',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: 'BOOK-001',
    vnp_OrderInfo: 'Dat coc BOOK-001',
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: 'https://hetcho.vn/return',
    vnp_IpAddr: '127.0.0.1',
    vnp_CreateDate: '20260701100000',
    vnp_ExpireDate: '20260701101500',
  };
}

describe('VNPay signature — buildSignString', () => {
  it('sorts keys alphabetically ascending', () => {
    const s = buildSignString({ b: '2', a: '1', c: '3' });
    expect(s).toBe('a=1&b=2&c=3');
  });

  it('drops vnp_SecureHash and vnp_SecureHashType', () => {
    const s = buildSignString({
      vnp_TxnRef: 'X',
      vnp_SecureHash: 'should-not-appear',
      vnp_SecureHashType: 'HmacSHA512',
    });
    expect(s).toBe('vnp_TxnRef=X');
  });

  it('drops empty string and undefined values', () => {
    const s = buildSignString({ a: '', b: 'keep', c: undefined });
    expect(s).toBe('b=keep');
  });

  it('url-encodes values (spaces as +)', () => {
    const s = buildSignString({ vnp_OrderInfo: 'Dat coc BOOK 001' });
    expect(s).toBe('vnp_OrderInfo=Dat+coc+BOOK+001');
  });

  it('coerces numeric values to string', () => {
    const s = buildSignString({ vnp_Amount: 5_000_000 });
    expect(s).toBe('vnp_Amount=5000000');
  });
});

describe('VNPay signature — sign + verify', () => {
  it('signs deterministically (lower-case hex, 128 chars for SHA-512)', () => {
    const sig = signVnpayParams(basicParams(), SECRET);
    expect(sig).toMatch(/^[0-9a-f]{128}$/);
    const again = signVnpayParams(basicParams(), SECRET);
    expect(again).toBe(sig);
  });

  it('verify returns true for correctly-signed payload', () => {
    const params = basicParams();
    const sig = signVnpayParams(params, SECRET);
    expect(verifyVnpaySignature({ ...params, vnp_SecureHash: sig }, SECRET)).toBe(true);
  });

  it('verify returns false when amount tampered', () => {
    const params = basicParams();
    const sig = signVnpayParams(params, SECRET);
    expect(
      verifyVnpaySignature(
        { ...params, vnp_Amount: '9999999', vnp_SecureHash: sig },
        SECRET,
      ),
    ).toBe(false);
  });

  it('verify returns false when txnRef tampered', () => {
    const params = basicParams();
    const sig = signVnpayParams(params, SECRET);
    expect(
      verifyVnpaySignature(
        { ...params, vnp_TxnRef: 'OTHER', vnp_SecureHash: sig },
        SECRET,
      ),
    ).toBe(false);
  });

  it('verify returns false when secret wrong', () => {
    const params = basicParams();
    const sig = signVnpayParams(params, SECRET);
    expect(verifyVnpaySignature({ ...params, vnp_SecureHash: sig }, 'WRONG_SECRET')).toBe(false);
  });

  it('verify returns false when vnp_SecureHash missing', () => {
    const params = basicParams();
    expect(verifyVnpaySignature(params, SECRET)).toBe(false);
  });

  it('verify is case-insensitive on hex (gateway may return upper-case)', () => {
    const params = basicParams();
    const sig = signVnpayParams(params, SECRET).toUpperCase();
    expect(verifyVnpaySignature({ ...params, vnp_SecureHash: sig }, SECRET)).toBe(true);
  });

  it('verify ignores vnp_SecureHashType param in the signed body', () => {
    const params = basicParams();
    const sig = signVnpayParams(params, SECRET);
    expect(
      verifyVnpaySignature(
        { ...params, vnp_SecureHashType: 'HmacSHA512', vnp_SecureHash: sig },
        SECRET,
      ),
    ).toBe(true);
  });
});
