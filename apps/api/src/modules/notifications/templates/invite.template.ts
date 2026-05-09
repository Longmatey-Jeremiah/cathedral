interface Args {
  inviteUrl: string;
  expiresAt: Date;
}

export function inviteEmail({ inviteUrl, expiresAt }: Args) {
  const subject = "You're invited to the Church Management Platform";
  const text = `You have been invited to join the Church Management Platform.

Accept your invite: ${inviteUrl}

This invitation expires at ${expiresAt.toUTCString()}.`;
  const html = `<p>You have been invited to join the Church Management Platform.</p>
<p><a href="${inviteUrl}">Accept your invite</a></p>
<p style="color:#636363;font-size:12px">This invitation expires at ${expiresAt.toUTCString()}.</p>`;
  return { subject, html, text };
}
