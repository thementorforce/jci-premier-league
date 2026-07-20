const RESEND_API_URL = 'https://api.resend.com/emails';

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

export async function sendRegistrationApprovalEmail(player) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REGISTRATION_EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn('Approval email was not sent: RESEND_API_KEY or REGISTRATION_EMAIL_FROM is not configured.');
    return false;
  }

  try {
    const playerName = escapeHtml(player.fullName);
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [player.email],
        subject: 'Your player registration is confirmed',
        html: `<p>Hi ${playerName},</p><p>Your payment has been verified and your player registration is confirmed.</p><p>We look forward to seeing you in the Franchise Cricket League season draft.</p><p>Regards,<br>Franchise Cricket League Team</p>`,
      }),
    });

    if (!response.ok) {
      console.error('Approval email failed:', await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('Approval email failed:', error);
    return false;
  }
}
