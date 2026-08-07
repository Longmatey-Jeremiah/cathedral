interface Args {
  sessionTitle: string;
  sessionDate: Date;
  presentCount: number;
}

export function attendanceReviewedEmail({
  sessionTitle,
  sessionDate,
  presentCount,
}: Args) {
  const subject = `Attendance reviewed: ${sessionTitle}`;
  const formattedDate = sessionDate.toDateString();
  const text = `You reviewed and signed off the attendance roll for "${sessionTitle}" (${formattedDate}).

${presentCount} member${presentCount === 1 ? '' : 's'} marked present. The roll is now locked.`;
  const html = `<p>You reviewed and signed off the attendance roll for <strong>${sessionTitle}</strong> (${formattedDate}).</p>
<p>${presentCount} member${presentCount === 1 ? '' : 's'} marked present. The roll is now locked.</p>`;
  const sms = `Church Platform: you reviewed "${sessionTitle}" (${formattedDate}). ${presentCount} present. Roll locked.`;
  return { subject, html, text, sms };
}
