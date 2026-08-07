import { NotificationChannel } from '@prisma/client';
import {
  NotificationsService,
  parseSender,
  toE164Digits,
} from './notifications.service';

/**
 * Delivery path only: does it call Brevo with the right envelope, stay quiet
 * without a key, honor the recipient's chosen channel, and never throw a
 * failed send back at the caller? Email and SMS share one Brevo API key.
 */
describe('NotificationsService — delivery', () => {
  const env: Record<string, string> = {
    BREVO_API_KEY: 'key-123',
    MAIL_FROM: 'Church Platform <noreply@church.app>',
    APP_URL: 'http://app.test',
    BREVO_SMS_SENDER: 'ChurchApp',
  };

  function build(overrides: Record<string, string | undefined> = {}) {
    const config = {
      get: (k: string) => ({ ...env, ...overrides })[k],
    };
    return new NotificationsService(config as never);
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('posts the invite email to Brevo', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: true, status: 200, text: async () => '' } as Response);

    await build().sendInvite({
      to: 'alice@x.test',
      inviteUrl: 'http://app.test/invite/accept?token=t',
      expiresAt: new Date('2026-01-01'),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.sender).toEqual({
      email: 'noreply@church.app',
      name: 'Church Platform',
    });
    expect(body.to).toEqual([{ email: 'alice@x.test' }]);
    expect(body.htmlContent).toContain('http://app.test/invite/accept?token=t');
  });

  it('logs instead of sending when no API key is set', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');

    await build({ BREVO_API_KEY: undefined }).sendTemporaryPassword({
      recipient: { email: 'bob@x.test', notifyVia: NotificationChannel.EMAIL },
      firstName: 'Bob',
      temporaryPassword: 'temp-pass-1',
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('swallows a rejected send so the caller still succeeds', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: false, status: 401, text: async () => 'bad key' } as Response);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(
      build().sendTemporaryPassword({
        recipient: { email: 'bob@x.test', notifyVia: NotificationChannel.EMAIL },
        firstName: 'Bob',
        temporaryPassword: 'temp-pass-1',
      }),
    ).resolves.toBeUndefined();
  });

  it('parses both sender formats', () => {
    expect(parseSender('a@b.test')).toEqual({ email: 'a@b.test' });
    expect(parseSender('"A B" <a@b.test>')).toEqual({ email: 'a@b.test', name: 'A B' });
  });

  it('strips everything but digits for Brevo\'s SMS recipient format', () => {
    expect(toE164Digits('+233 54 342 7199')).toBe('233543427199');
    expect(toE164Digits('0543427199')).toBe('0543427199');
  });
});

describe('NotificationsService — channel routing', () => {
  const env: Record<string, string> = {
    BREVO_API_KEY: 'key-123',
    MAIL_FROM: 'Church Platform <noreply@church.app>',
    APP_URL: 'http://app.test',
    BREVO_SMS_SENDER: 'ChurchApp',
  };
  const service = () => new NotificationsService({ get: (k: string) => env[k] } as never);

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function reviewArgs(overrides: Partial<Parameters<NotificationsService['sendAttendanceReviewed']>[0]['recipient']>) {
    return {
      recipient: { email: 'r@x.test', phone: '+233543427199', notifyVia: NotificationChannel.EMAIL, ...overrides },
      sessionTitle: 'Sunday Service',
      sessionDate: new Date('2026-01-04'),
      presentCount: 12,
    };
  }

  it('EMAIL: sends only mail, even with a phone on file', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: true, status: 200, text: async () => '' } as Response);

    await service().sendAttendanceReviewed(reviewArgs({ notifyVia: NotificationChannel.EMAIL }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.brevo.com/v3/smtp/email');
  });

  it('SMS: texts only, no email, when a phone is on file', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: true, status: 200, text: async () => '' } as Response);

    await service().sendAttendanceReviewed(reviewArgs({ notifyVia: NotificationChannel.SMS }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.brevo.com/v3/transactionalSMS/sms');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.recipient).toBe('233543427199');
    expect(body.sender).toBe('ChurchApp');
    expect(body.type).toBe('transactional');
  });

  it('SMS requested but no phone on file: falls back to email', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: true, status: 200, text: async () => '' } as Response);

    await service().sendAttendanceReviewed(
      reviewArgs({ notifyVia: NotificationChannel.SMS, phone: null }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.brevo.com/v3/smtp/email');
  });

  it('BOTH: sends email and text', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: true, status: 200, text: async () => '' } as Response);

    await service().sendAttendanceReviewed(reviewArgs({ notifyVia: NotificationChannel.BOTH }));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const urls = fetchMock.mock.calls.map((c) => c[0]);
    expect(urls).toContain('https://api.brevo.com/v3/smtp/email');
    expect(urls).toContain('https://api.brevo.com/v3/transactionalSMS/sms');
  });

  it('logs instead of sending either channel when no API key is set', async () => {
    const noKey = new NotificationsService({
      get: (k: string) => ({ ...env, BREVO_API_KEY: undefined })[k],
    } as never);
    const fetchMock = jest.spyOn(global, 'fetch');

    await noKey.sendAttendanceReviewed(reviewArgs({ notifyVia: NotificationChannel.BOTH }));

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
