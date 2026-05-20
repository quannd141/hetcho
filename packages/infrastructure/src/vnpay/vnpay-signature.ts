import { createHmac } from 'node:crypto';

/**
 * VNPay signature utility (HMAC-SHA512 over alphabetically sorted query string).
 *
 * Spec (VNPay v2 — payment + IPN):
 *   1. Drop `vnp_SecureHash` and `vnp_SecureHashType` from incoming params.
 *   2. Drop empty-string values (per merchant-doc 2024).
 *   3. Sort remaining keys alphabetically ASC.
 *   4. Build a query string `key=urlEncodedValue&...` using
 *      `encodeURIComponent` then replace spaces with `+` (form-encoded).
 *   5. HMAC-SHA512(signString, secretKey) → hex lower-case.
 *
 * NOTE: VNPay's reference Java SDK uses `URLEncoder.encode(value, "UTF-8")`
 * which produces `+` for spaces. We mirror that here.
 */

const HASH_PARAM = 'vnp_SecureHash';
const HASH_TYPE_PARAM = 'vnp_SecureHashType';

export type VnpayParams = Record<string, string | number | undefined>;

export function buildSignString(rawParams: VnpayParams): string {
  const entries: Array<[string, string]> = [];
  for (const [key, value] of Object.entries(rawParams)) {
    if (key === HASH_PARAM || key === HASH_TYPE_PARAM) continue;
    if (value === undefined || value === null) continue;
    const str = String(value);
    if (str.length === 0) continue;
    entries.push([key, str]);
  }
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return entries
    .map(([k, v]) => `${k}=${encodeFormComponent(v)}`)
    .join('&');
}

function encodeFormComponent(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, '+');
}

export function signVnpayParams(params: VnpayParams, secretKey: string): string {
  if (!secretKey) throw new Error('VNPay secret key required');
  const signString = buildSignString(params);
  return createHmac('sha512', secretKey).update(signString, 'utf8').digest('hex');
}

export function verifyVnpaySignature(allParams: VnpayParams, secretKey: string): boolean {
  const incomingHash = allParams[HASH_PARAM];
  if (typeof incomingHash !== 'string' || incomingHash.length === 0) return false;
  const expected = signVnpayParams(allParams, secretKey);
  return safeEqualHex(incomingHash, expected);
}

function safeEqualHex(a: string, b: string): boolean {
  const lowerA = a.toLowerCase();
  const lowerB = b.toLowerCase();
  if (lowerA.length !== lowerB.length) return false;
  let diff = 0;
  for (let i = 0; i < lowerA.length; i++) {
    diff |= lowerA.charCodeAt(i) ^ lowerB.charCodeAt(i);
  }
  return diff === 0;
}
