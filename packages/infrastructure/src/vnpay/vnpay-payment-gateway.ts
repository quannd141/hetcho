import type { PaymentGateway } from '@hetcho/application';
import { logger } from '@hetcho/shared';
import { signVnpayParams, type VnpayParams } from './vnpay-signature.js';

export interface VnpayConfig {
  tmnCode: string;
  hashSecret: string;
  payUrl: string;
  returnUrl: string;
  locale?: 'vn' | 'en';
  currency?: 'VND';
  version?: '2.1.0';
}

/**
 * VNPay payment gateway adapter (skeleton — production-ready signature,
 * test-mode network stub).
 *
 * Behavior:
 *  - createDeposit builds + signs a fully valid VNPay payment URL.
 *  - It does NOT call the VNPay API directly (VNPay is redirect-based:
 *    the URL itself is the entrypoint — merchant just serves it to the user).
 *  - In NIGHT_SHIFT_MODE the container still uses MockPaymentGateway by
 *    default; this adapter is wired only when VNPAY_TMN_CODE +
 *    VNPAY_HASH_SECRET are present (Sprint 4+ real-wire).
 *  - Webhook verification (IPN/return URL) belongs at the route handler:
 *    use `verifyVnpaySignature` from `./vnpay-signature.ts`.
 */
export class VnpayPaymentGateway implements PaymentGateway {
  constructor(private readonly config: VnpayConfig) {
    if (!config.tmnCode) throw new Error('VNPay tmnCode required');
    if (!config.hashSecret) throw new Error('VNPay hashSecret required');
    if (!config.payUrl) throw new Error('VNPay payUrl required');
  }

  async createDeposit(input: Parameters<PaymentGateway['createDeposit']>[0]): ReturnType<
    PaymentGateway['createDeposit']
  > {
    const createDate = formatVnpayDate(new Date());
    const expireDate = formatVnpayDate(new Date(Date.now() + 15 * 60_000));
    const gatewayTxnId = `${input.bookingId}-${Date.now()}`;

    const params: VnpayParams = {
      vnp_Version: this.config.version ?? '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.config.tmnCode,
      vnp_Amount: input.amountVnd * 100,
      vnp_CurrCode: this.config.currency ?? 'VND',
      vnp_TxnRef: gatewayTxnId,
      vnp_OrderInfo: `Dat coc ${input.bookingId}`,
      vnp_OrderType: 'other',
      vnp_Locale: this.config.locale ?? 'vn',
      vnp_ReturnUrl: this.config.returnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };
    const signature = signVnpayParams(params, this.config.hashSecret);
    const query = buildQueryString({ ...params, vnp_SecureHash: signature });
    const paymentUrl = `${this.config.payUrl}?${query}`;

    logger.info('[VNPAY] payment.createDeposit', {
      tenantId: input.tenantId,
      bookingId: input.bookingId,
      gatewayTxnId,
      amountVnd: input.amountVnd,
    });

    return { paymentUrl, gatewayTxnId };
  }
}

export function formatVnpayDate(date: Date): string {
  // VNPay expects yyyyMMddHHmmss in Asia/Ho_Chi_Minh (UTC+7).
  const vn = new Date(date.getTime() + 7 * 3600_000);
  const y = vn.getUTCFullYear();
  const m = String(vn.getUTCMonth() + 1).padStart(2, '0');
  const d = String(vn.getUTCDate()).padStart(2, '0');
  const hh = String(vn.getUTCHours()).padStart(2, '0');
  const mm = String(vn.getUTCMinutes()).padStart(2, '0');
  const ss = String(vn.getUTCSeconds()).padStart(2, '0');
  return `${y}${m}${d}${hh}${mm}${ss}`;
}

function buildQueryString(params: VnpayParams): string {
  const out: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    const s = String(v);
    if (s.length === 0) continue;
    out.push(`${k}=${encodeURIComponent(s).replace(/%20/g, '+')}`);
  }
  return out.join('&');
}
