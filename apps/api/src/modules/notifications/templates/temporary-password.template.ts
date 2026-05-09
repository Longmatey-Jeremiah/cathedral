interface Args {
  firstName?: string | null;
  temporaryPassword: string;
  appUrl: string;
}

export function temporaryPasswordEmail({ firstName, temporaryPassword, appUrl }: Args) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hello,';
  const subject = 'Your church platform account is ready';
  const text = `${greeting}

An account has been created for you on the Church Management Platform.

Temporary password: ${temporaryPassword}

Sign in at ${appUrl}/login. You will be required to change this password on first login.`;
  const html = `<p>${greeting}</p>
<p>An account has been created for you on the Church Management Platform.</p>
<p><strong>Temporary password:</strong> <code>${temporaryPassword}</code></p>
<p>Sign in at <a href="${appUrl}/login">${appUrl}/login</a>. You will be required to change this password on first login.</p>`;
  return { subject, html, text };
}
