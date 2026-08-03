import { NotificationsService, parseSender } from './notifications.service';

/**
 * Delivery path only: does it call Brevo with the right envelope, stay quiet
 * without a key, and never throw a failed send back at the caller?
 */
describe('NotificationsService — Brevo delivery', () => {
  const env: Record<string, string> = {
    BREVO_API_KEY: 'key-123',
    MAIL_FROM: 'Church Platform <noreply@church.app>',
    APP_URL: 'http://app.test',
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

  it('posts the email to Brevo', async () => {
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
      to: 'bob@x.test',
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
        to: 'bob@x.test',
        firstName: 'Bob',
        temporaryPassword: 'temp-pass-1',
      }),
    ).resolves.toBeUndefined();
  });

  it('parses both sender formats', () => {
    expect(parseSender('a@b.test')).toEqual({ email: 'a@b.test' });
    expect(parseSender('"A B" <a@b.test>')).toEqual({ email: 'a@b.test', name: 'A B' });
  });
});
