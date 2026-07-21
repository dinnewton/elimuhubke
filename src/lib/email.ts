import "server-only";
import { Resend } from "resend";

export const emailMockMode = !process.env.RESEND_API_KEY;

const resend = emailMockMode ? null : new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "ElimuHubKE <onboarding@resend.dev>";

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

// Falls back to logging the email instead of sending when RESEND_API_KEY
// isn't configured — same "sandbox by default" pattern as src/lib/mpesa.ts.
export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (emailMockMode || !resend) {
    console.log(`\n[email:mock] To: ${to}\nSubject: ${subject}\n${html}\n`);
    return;
  }

  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) {
    console.error("Failed to send email:", error);
  }
}

function emailShell(bodyHtml: string) {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; color: #18251f;">
      <div style="padding: 24px 0; text-align: center;">
        <span style="display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; background: #1a9b6c; color: #fff; font-weight: 700; font-size: 16px;">T</span>
        <span style="font-weight: 700; font-size: 18px; margin-left: 8px; vertical-align: middle;">ElimuHubKE</span>
      </div>
      <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px;">
        ${bodyHtml}
      </div>
      <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 24px;">
        ElimuHubKE &middot; Kenyan &amp; international learners, connected with teachers.
      </p>
    </div>
  `;
}

export function passwordResetEmail(resetUrl: string) {
  return emailShell(`
    <h2 style="margin: 0 0 12px;">Reset your password</h2>
    <p>We received a request to reset your ElimuHubKE password. This link expires in 1 hour.</p>
    <p style="margin: 24px 0;">
      <a href="${resetUrl}" style="background: #1a9b6c; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset password</a>
    </p>
    <p style="color: #6b7280; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
  `);
}

export function bookingConfirmedEmail(params: {
  subjectName: string;
  otherPartyName: string;
  whenText: string;
  amountText: string;
}) {
  return emailShell(`
    <h2 style="margin: 0 0 12px;">Session confirmed</h2>
    <p><strong>${params.subjectName}</strong> with ${params.otherPartyName}</p>
    <p>${params.whenText}</p>
    <p>Amount paid: <strong>${params.amountText}</strong></p>
    <p style="color: #6b7280; font-size: 13px;">Log in to ElimuHubKE to join the session when it's time.</p>
  `);
}

export function documentPurchaseEmail(params: { title: string; amountText: string }) {
  return emailShell(`
    <h2 style="margin: 0 0 12px;">Purchase confirmed</h2>
    <p>You bought <strong>${params.title}</strong> for ${params.amountText}.</p>
    <p style="color: #6b7280; font-size: 13px;">Find it anytime in "My library" on ElimuHubKE.</p>
  `);
}

export function payoutPaidEmail(params: { weekRangeText: string; amountText: string }) {
  return emailShell(`
    <h2 style="margin: 0 0 12px;">You've been paid</h2>
    <p>Your ElimuHubKE earnings for ${params.weekRangeText} have been sent to your M-Pesa line.</p>
    <p>Amount: <strong>${params.amountText}</strong></p>
  `);
}
