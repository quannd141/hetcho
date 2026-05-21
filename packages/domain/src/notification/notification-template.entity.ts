import { ValidationError } from '@hetcho/shared';
import type { NotificationTemplateId, TenantId } from '@hetcho/shared';

/**
 * Trigger maps 1:1 to an audit event action that subscribers listen for.
 * Adding a new trigger means: emit the matching audit event from a use case
 * + write a dispatcher subscriber that reads the template + sends via ZNS.
 */
export type NotificationTrigger =
  | 'booking.confirmed'
  | 'reminder.t_minus_24h'
  | 'reminder.t_minus_2h'
  | 'booking.completed'
  | 'package.expiring_soon'
  | 'customer.recovery_30d'
  | 'customer.recovery_60d'
  | 'customer.recovery_90d';

export type NotificationChannel = 'zns' | 'oa_broadcast';

export interface NotificationTemplateProps {
  id: NotificationTemplateId;
  tenantId: TenantId;
  trigger: NotificationTrigger;
  channel: NotificationChannel;
  name: string;
  body: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PLACEHOLDER_REGEX = /\{\{\s*([a-zA-Z][a-zA-Z0-9_.]*)\s*\}\}/g;
const MAX_BODY_LENGTH = 1000;

/**
 * Owner-editable ZNS / Zalo OA broadcast template. One template per
 * (tenant, trigger) so the dispatcher does a single lookup; updating
 * the body produces a new updatedAt timestamp.
 */
export class NotificationTemplate {
  private constructor(private props: NotificationTemplateProps) {}

  static create(input: {
    id: NotificationTemplateId;
    tenantId: TenantId;
    trigger: NotificationTrigger;
    channel: NotificationChannel;
    name: string;
    body: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): NotificationTemplate {
    const name = input.name.trim();
    if (!name) throw new ValidationError('Template name required');
    const body = input.body.trim();
    if (!body) throw new ValidationError('Template body required');
    if (body.length > MAX_BODY_LENGTH) {
      throw new ValidationError(`Template body too long (max ${MAX_BODY_LENGTH} chars)`);
    }
    const at = input.createdAt ?? new Date();
    return new NotificationTemplate({
      id: input.id,
      tenantId: input.tenantId,
      trigger: input.trigger,
      channel: input.channel,
      name,
      body,
      isActive: input.isActive ?? true,
      createdAt: at,
      updatedAt: input.updatedAt ?? at,
    });
  }

  static reconstruct(props: NotificationTemplateProps): NotificationTemplate {
    return new NotificationTemplate(props);
  }

  get id(): NotificationTemplateId { return this.props.id; }
  get tenantId(): TenantId { return this.props.tenantId; }
  get trigger(): NotificationTrigger { return this.props.trigger; }
  get channel(): NotificationChannel { return this.props.channel; }
  get name(): string { return this.props.name; }
  get body(): string { return this.props.body; }
  get isActive(): boolean { return this.props.isActive; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  updateBody(body: string, at: Date): void {
    const trimmed = body.trim();
    if (!trimmed) throw new ValidationError('Template body required');
    if (trimmed.length > MAX_BODY_LENGTH) {
      throw new ValidationError(`Template body too long (max ${MAX_BODY_LENGTH} chars)`);
    }
    this.props.body = trimmed;
    this.props.updatedAt = at;
  }

  rename(name: string, at: Date): void {
    const trimmed = name.trim();
    if (!trimmed) throw new ValidationError('Template name required');
    this.props.name = trimmed;
    this.props.updatedAt = at;
  }

  activate(at: Date): void {
    if (this.props.isActive) return;
    this.props.isActive = true;
    this.props.updatedAt = at;
  }

  deactivate(at: Date): void {
    if (!this.props.isActive) return;
    this.props.isActive = false;
    this.props.updatedAt = at;
  }

  /** Distinct placeholder names referenced in body, e.g. ['customer.name', 'tenant.name']. */
  placeholders(): string[] {
    const found = new Set<string>();
    for (const match of this.props.body.matchAll(PLACEHOLDER_REGEX)) {
      const key = match[1];
      if (key) found.add(key);
    }
    return [...found];
  }

  /**
   * Render with handlebars-style `{{ key }}` interpolation. Nested keys
   * (`customer.name`) walk the variables object. Missing keys collapse to
   * empty string — dispatchers are expected to validate inputs first.
   */
  render(variables: Record<string, unknown>): string {
    return this.props.body.replace(PLACEHOLDER_REGEX, (_, rawKey: string) => {
      const path = rawKey.split('.');
      let current: unknown = variables;
      for (const segment of path) {
        if (current && typeof current === 'object' && segment in (current as Record<string, unknown>)) {
          current = (current as Record<string, unknown>)[segment];
        } else {
          return '';
        }
      }
      return current === null || current === undefined ? '' : String(current);
    });
  }

  toJSON(): NotificationTemplateProps { return { ...this.props }; }
}
