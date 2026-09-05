// Denly mailer — plain fetch to Resend, no SDK.
// If RESEND_API_KEY is unset, every send falls back to a console log
// (the roadmap's documented fallback) — callers' requests still succeed.

const FROM = 'Denly <onboarding@resend.dev>';
const ACCENT = '#e8622c';

// One shared HTML template reused by all helpers
const template = (title, body) => `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1f2937;">
    <div style="border-top: 4px solid ${ACCENT}; border-radius: 8px; overflow: hidden; background: #ffffff;">
      <div style="padding: 28px 28px 8px;">
        <h1 style="margin: 0 0 16px; font-size: 22px; color: #111827;">${title}</h1>
        <div style="font-size: 15px; line-height: 1.6;">${body}</div>
      </div>
      <div style="padding: 20px 28px 26px; font-size: 12px; color: #6b7280; border-top: 1px solid #f3f4f6;">
        You're receiving this because of your activity on
        <a href="https://denly.app" style="color: ${ACCENT}; text-decoration: none;">Denly</a> —
        find pets, vets, and care resources near you.
      </div>
    </div>
  </div>`;

const sendEmail = async (to, subject, html) => {
    if (!to) {
        // Anonymous flows (e.g. public bookings) have no email — nothing to send.
        console.log('[mailer:fallback]', { to, subject });
        return { skipped: true };
    }
    if (!process.env.RESEND_API_KEY) {
        console.log('[mailer:fallback]', { to, subject });
        return { skipped: true };
    }
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(`Resend responded ${response.status}: ${detail}`);
    }
    return { sent: true };
};

exports.sendEmail = sendEmail;

exports.applicationReceivedEmail = (to, { petName, applicantName }) =>
    sendEmail(
        to,
        `Your adoption application for ${petName} was received`,
        template(
            'Application received 🐾',
            `<p>Hi ${applicantName || 'there'},</p>
             <p>Your application to adopt <strong>${petName}</strong> has been received and is now <strong>pending review</strong>. The shelter will get back to you soon.</p>
             <p>You can track its status anytime from your Denly dashboard.</p>`
        )
    );

exports.applicationDecisionEmail = (to, { petName, approved }) =>
    sendEmail(
        to,
        approved
            ? `Congratulations — your application for ${petName} was approved!`
            : `Update on your application for ${petName}`,
        template(
            approved ? 'Your application was approved 🎉' : 'Application update',
            approved
                ? `<p>Great news — your application to adopt <strong>${petName}</strong> was <strong>approved</strong>!</p>
                   <p>The shelter will reach out with next steps for the meet-and-greet and handover.</p>`
                : `<p>Thanks for applying to adopt <strong>${petName}</strong>.</p>
                   <p>Unfortunately, the shelter has moved forward with another applicant this time. There are plenty of other pets waiting for a home like yours — keep browsing on Denly.</p>`
        )
    );

exports.appointmentConfirmedEmail = (to, { partnerName, date, type }) =>
    sendEmail(
        to,
        `Your ${type} appointment with ${partnerName} is confirmed`,
        template(
            'Appointment confirmed ✔',
            `<p>Your <strong>${type}</strong> appointment with <strong>${partnerName}</strong> on <strong>${date}</strong> has been confirmed.</p>
             <p>Please arrive on time, and bring any previous medical records if you have them.</p>`
        )
    );
