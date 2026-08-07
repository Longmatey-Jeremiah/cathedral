import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel } from '@prisma/client';
import { attendanceReviewedEmail } from './templates/attendance-reviewed.template';
import { inviteEmail } from './templates/invite.template';
import { temporaryPasswordEmail } from './templates/temporary-password.template';

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** A notification recipient with an account — chooses their own channel. */
export interface Recipient {
  email: string;
  phone?: string | null;
  notifyVia: NotificationChannel;
}

/** Email is always required; sms is only sent when the template has one. */
interface Content {
  subject: string;
  html: string;
  text: string;
  sms?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly config: ConfigService) {}

  async sendTemporaryPassword(args: {
    recipient: Recipient;
    firstName?: string | null;
    temporaryPassword: string;
  }): Promise<void> {
    const content = temporaryPasswordEmail({
      firstName: args.firstName,
      temporaryPassword: args.temporaryPassword,
      appUrl: this.config.get<string>('APP_URL') ?? '',
    });
    await this.dispatch(args.recipient, content);
  }

  /** Invite recipients have no account yet, so there is no channel
   *  preference to read — always email. */
  async sendInvite(args: {
    to: string;
    inviteUrl: string;
    expiresAt: Date;
  }): Promise<void> {
    const { html, text, subject } = inviteEmail({
      inviteUrl: args.inviteUrl,
      expiresAt: args.expiresAt,
    });
    await this.send({ to: args.to, subject, html, text });
  }

  async sendAttendanceReviewed(args: {
    recipient: Recipient;
    sessionTitle: string;
    sessionDate: Date;
    presentCount: number;
  }): Promise<void> {
    const content = attendanceReviewedEmail({
      sessionTitle: args.sessionTitle,
      sessionDate: args.sessionDate,
      presentCount: args.presentCount,
    });
    await this.dispatch(args.recipient, content);
  }

  /**
   * Routes a notification to the recipient's chosen channel(s). Falls back to
   * email when SMS is wanted but there's no phone on file or the template has
   * no sms copy — a notification should never silently disappear because
   * delivery config is incomplete.
   */
  private async dispatch(
    recipient: Recipient,
    content: Content,
  ): Promise<void> {
    const canText = Boolean(recipient.phone && content.sms);
    const wantsSms =
      recipient.notifyVia === NotificationChannel.SMS ||
      recipient.notifyVia === NotificationChannel.BOTH;
    const wantsEmail =
      recipient.notifyVia === NotificationChannel.EMAIL ||
      recipient.notifyVia === NotificationChannel.BOTH ||
      !canText; // SMS wanted but unavailable — email is the fallback.

    if (wantsSms && canText) {
      await this.sendSms({ to: recipient.phone!, body: content.sms! });
    }
    if (wantsEmail) {
      await this.send({
        to: recipient.email,
        subject: content.subject,
        html: content.html,
        text: content.text,
      });
    }
  }

  private async sendSms(args: { to: string; body: string }): Promise<void> {
    const apiKey = this.config.get<string>('BREVO_API_KEY');
    if (!apiKey) {
      // No key configured (local dev): log so flows stay testable.
      this.logger.log(`[sms:noop] -> ${args.to}`);
      this.logger.debug(args.body);
      return;
    }

    // Same fire-and-log contract as send(): the caller's row is already
    // committed, so a failed text must not fail the request.
    try {
      const res = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
        method: 'POST',
        headers: { 'api-key': apiKey, 'content-type': 'application/json' },
        body: JSON.stringify({
          sender: this.config.get<string>('BREVO_SMS_SENDER') ?? 'ChurchApp',
          recipient: toE164Digits(args.to),
          content: args.body,
          type: 'transactional',
        }),
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${await res.text()}`);
      }
      this.logger.log(`[sms] -> ${args.to}`);
    } catch (err) {
      this.logger.error(`[sms:failed] -> ${args.to} :: ${String(err)}`);
    }
  }

  private async send(args: SendArgs): Promise<void> {
    const apiKey = this.config.get<string>('BREVO_API_KEY');
    if (!apiKey) {
      // No key configured (local dev): log so flows stay testable.
      this.logger.log(`[mail:noop] -> ${args.to} :: ${args.subject}`);
      this.logger.debug(args.text);
      return;
    }

    // ponytail: fire-and-log. Callers have already written their row, so a
    // failed send must not 500 the request. Add a retry queue if delivery
    // failures start mattering.
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': apiKey, 'content-type': 'application/json' },
        body: JSON.stringify({
          sender: parseSender(this.config.get<string>('MAIL_FROM')),
          to: [{ email: args.to }],
          subject: args.subject,
          htmlContent: args.html,
          textContent: args.text,
        }),
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${await res.text()}`);
      }
      this.logger.log(`[mail] -> ${args.to} :: ${args.subject}`);
    } catch (err) {
      this.logger.error(
        `[mail:failed] -> ${args.to} :: ${args.subject} :: ${String(err)}`,
      );
    }
  }
}

/** "Church Platform <no-reply@church.app>" or a bare address. */
export function parseSender(from = ''): { email: string; name?: string } {
  const match = /^\s*"?(.*?)"?\s*<(.+)>\s*$/.exec(from);
  return match
    ? { email: match[2].trim(), ...(match[1] ? { name: match[1] } : {}) }
    : { email: from.trim() };
}

/** Brevo wants digits only, no leading '+' — "+233 54 342 7199" -> "233543427199". */
export function toE164Digits(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}
