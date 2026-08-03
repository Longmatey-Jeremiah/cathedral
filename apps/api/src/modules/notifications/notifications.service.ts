import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { inviteEmail } from './templates/invite.template';
import { temporaryPasswordEmail } from './templates/temporary-password.template';

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly config: ConfigService) {}

  async sendTemporaryPassword(args: {
    to: string;
    firstName?: string | null;
    temporaryPassword: string;
  }): Promise<void> {
    const { html, text, subject } = temporaryPasswordEmail({
      firstName: args.firstName,
      temporaryPassword: args.temporaryPassword,
      appUrl: this.config.get<string>('APP_URL') ?? '',
    });
    await this.send({ to: args.to, subject, html, text });
  }

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
