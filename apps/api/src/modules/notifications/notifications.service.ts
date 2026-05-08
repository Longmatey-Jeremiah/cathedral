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
    // Real implementation wires to SMTP/SES/Resend. For now log so flows are
    // testable end-to-end without an SMTP dependency.
    this.logger.log(`[mail] -> ${args.to} :: ${args.subject}`);
    this.logger.debug(args.text);
    return Promise.resolve();
  }
}
