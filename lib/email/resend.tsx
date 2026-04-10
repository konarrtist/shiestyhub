import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
}

export async function sendEmail({
  to,
  subject,
  html,
  from = "Bunkerfy <noreply@bunkerfy.top>",
  replyTo,
}: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo,
    })

    if (error) {
      console.error("[Resend] Error sending email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("[Resend] Exception sending email:", error)
    return { success: false, error }
  }
}

// Email template helper
export function getEmailTemplate(
  title: string,
  preheader: string,
  content: string,
  buttonText?: string,
  buttonUrl?: string,
) {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0b0c0f; font-family: 'Helvetica Neue', Arial, sans-serif; color: #0f1114;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0b0c0f; padding: 32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width: 600px; max-width: 90%; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);">
            <tr>
              <td style="background-color: #0f1114; padding: 20px 24px; color: #f8fafc;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width: 100%;">
                  <tr>
                    <td style="width: 44px; vertical-align: middle;">
                      <img src="https://bunkerfy.top/icon-dark-32x32.png" alt="Bunkerfy logo" width="36" height="36" style="display: block; border: 0; border-radius: 8px; background: #f8fafc;" />
                    </td>
                    <td style="vertical-align: middle; font-size: 18px; font-weight: 700; letter-spacing: 0.2px;">Bunkerfy</td>
                    <td style="vertical-align: middle; text-align: right; font-size: 12px; color: #cbd5e1;">${preheader}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 28px 24px 12px;">
                ${content}
                ${
                  buttonText && buttonUrl
                    ? `
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 18px;">
                  <tr>
                    <td align="center" bgcolor="#0f1114" style="border-radius: 10px;">
                      <a href="${buttonUrl}" style="display: inline-block; padding: 12px 18px; font-size: 15px; font-weight: 700; color: #f8fafc; text-decoration: none; background-color: #0f1114; border-radius: 10px;">${buttonText}</a>
                    </td>
                  </tr>
                </table>
                `
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 24px 24px; background-color: #f8fafc; border-top: 1px solid #e5e7eb; color: #4b5563; font-size: 12px; line-height: 1.6;">
                You are receiving this message because your address is registered with Bunkerfy. Keep this link private to protect your account.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
}

// Pre-built email templates
export const emailTemplates = {
  confirmSignup: (confirmationUrl: string) => ({
    subject: "Confirm your Bunkerfy account",
    html: getEmailTemplate(
      "Confirm your signup",
      "Account verification",
      `
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #4b5563;">Confirm your email</p>
        <h1 style="margin: 0 0 12px; font-size: 24px; line-height: 1.3; color: #0f1114;">Welcome to Bunkerfy!</h1>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;">Please confirm your email address to activate your account and start trading safely on the Arc Raiders marketplace.</p>
      `,
      "Confirm email",
      confirmationUrl,
    ),
  }),

  resetPassword: (resetUrl: string) => ({
    subject: "Reset your Bunkerfy password",
    html: getEmailTemplate(
      "Reset your password",
      "Password reset",
      `
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #4b5563;">Reset password</p>
        <h1 style="margin: 0 0 12px; font-size: 24px; line-height: 1.3; color: #0f1114;">Password Reset Request</h1>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;">We received a request to reset the password for your Bunkerfy account. Click the button below to create a new password.</p>
        <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.6; color: #6b7280;">If you didn't request a password reset, no action is needed and your existing password remains valid.</p>
      `,
      "Reset password",
      resetUrl,
    ),
  }),

  magicLink: (magicLinkUrl: string) => ({
    subject: "Your Bunkerfy login link",
    html: getEmailTemplate(
      "Magic Link",
      "Login link",
      `
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #4b5563;">Magic Link</p>
        <h1 style="margin: 0 0 12px; font-size: 24px; line-height: 1.3; color: #0f1114;">Sign in to Bunkerfy</h1>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;">Click the button below to sign in to your account. This link will expire in 1 hour.</p>
      `,
      "Sign in",
      magicLinkUrl,
    ),
  }),

  changeEmail: (confirmationUrl: string) => ({
    subject: "Confirm your new email address",
    html: getEmailTemplate(
      "Change email address",
      "Email change",
      `
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #4b5563;">Verify new email</p>
        <h1 style="margin: 0 0 12px; font-size: 24px; line-height: 1.3; color: #0f1114;">Confirm Email Change</h1>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;">We received a request to change the email address on your Bunkerfy account. Confirm the new address to keep your access secure.</p>
      `,
      "Verify new email",
      confirmationUrl,
    ),
  }),

  inviteUser: (inviteUrl: string, inviterName?: string) => ({
    subject: "You've been invited to Bunkerfy",
    html: getEmailTemplate(
      "Invitation",
      "Account invitation",
      `
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #4b5563;">Invitation</p>
        <h1 style="margin: 0 0 12px; font-size: 24px; line-height: 1.3; color: #0f1114;">You're Invited!</h1>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;">${inviterName ? `<strong>${inviterName}</strong> has invited you to join` : "You have been invited to join"} Bunkerfy, the secure Arc Raiders trading marketplace with escrow protection.</p>
      `,
      "Accept Invitation",
      inviteUrl,
    ),
  }),

  // Existing templates
  tradeInitiated: (buyerName: string, listingTitle: string, tradeUrl: string) => ({
    subject: `New trade request for "${listingTitle}"`,
    html: getEmailTemplate(
      "New Trade Request",
      "Trade notification",
      `
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #4b5563;">New Trade Request</p>
        <h1 style="margin: 0 0 12px; font-size: 24px; line-height: 1.3; color: #0f1114;">Someone wants to trade!</h1>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;"><strong>${buyerName}</strong> has initiated a trade for your listing "<strong>${listingTitle}</strong>".</p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;">Review the trade details and respond to the buyer.</p>
      `,
      "View Trade",
      tradeUrl,
    ),
  }),

  tradeCompleted: (partnerName: string, listingTitle: string, profileUrl: string) => ({
    subject: `Trade completed for "${listingTitle}"`,
    html: getEmailTemplate(
      "Trade Completed",
      "Trade notification",
      `
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #4b5563;">Trade Complete</p>
        <h1 style="margin: 0 0 12px; font-size: 24px; line-height: 1.3; color: #0f1114;">Trade Successfully Completed!</h1>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;">Your trade with <strong>${partnerName}</strong> for "<strong>${listingTitle}</strong>" has been completed.</p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;">Don't forget to leave a review for your trading partner!</p>
      `,
      "Leave Review",
      profileUrl,
    ),
  }),

  newMessage: (senderName: string, preview: string, messagesUrl: string) => ({
    subject: `New message from ${senderName}`,
    html: getEmailTemplate(
      "New Message",
      "Message notification",
      `
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #4b5563;">New Message</p>
        <h1 style="margin: 0 0 12px; font-size: 24px; line-height: 1.3; color: #0f1114;">You have a new message</h1>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;"><strong>${senderName}</strong> sent you a message:</p>
        <p style="margin: 0 0 16px; padding: 12px; background-color: #f3f4f6; border-radius: 8px; font-size: 14px; line-height: 1.6; color: #374151; font-style: italic;">"${preview}"</p>
      `,
      "View Messages",
      messagesUrl,
    ),
  }),

  reportReceived: (reportId: string, reportedUser: string) => ({
    subject: "Your report has been received",
    html: getEmailTemplate(
      "Report Received",
      "Support notification",
      `
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #4b5563;">Report Submitted</p>
        <h1 style="margin: 0 0 12px; font-size: 24px; line-height: 1.3; color: #0f1114;">Report Received</h1>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;">We have received your report regarding <strong>${reportedUser}</strong>.</p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;">Report ID: <strong>${reportId}</strong></p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;">Our escrow team will review this report and take appropriate action. You may be contacted for additional information.</p>
      `,
    ),
  }),

  accountBanned: (reason: string) => ({
    subject: "Your Bunkerfy account has been suspended",
    html: getEmailTemplate(
      "Account Suspended",
      "Account notification",
      `
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #dc2626;">Account Suspended</p>
        <h1 style="margin: 0 0 12px; font-size: 24px; line-height: 1.3; color: #0f1114;">Account Suspension Notice</h1>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;">Your Bunkerfy account has been suspended due to a violation of our terms of service.</p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;"><strong>Reason:</strong> ${reason}</p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;">If you believe this is an error, please contact our support team.</p>
      `,
    ),
  }),

  tradeCancelled: (cancellerName: string, listingTitle: string, tradeUrl: string) => ({
    subject: `Trade cancelled for "${listingTitle}"`,
    html: getEmailTemplate(
      "Trade Cancelled",
      "Trade notification",
      `
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #dc2626;">Trade Cancelled</p>
        <h1 style="margin: 0 0 12px; font-size: 24px; line-height: 1.3; color: #0f1114;">Trade Cancelled</h1>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;"><strong>${cancellerName}</strong> has cancelled the trade for "<strong>${listingTitle}</strong>".</p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;">You can start a new trade from the marketplace at any time.</p>
      `,
      "View Trade",
      tradeUrl,
    ),
  }),

  tradeExpired: (listingTitle: string, tradeUrl: string) => ({
    subject: `Trade expired for "${listingTitle}"`,
    html: getEmailTemplate(
      "Trade Expired",
      "Trade notification",
      `
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #dc2626;">Trade Expired</p>
        <h1 style="margin: 0 0 12px; font-size: 24px; line-height: 1.3; color: #0f1114;">Trade Timeout</h1>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;">Your trade for "<strong>${listingTitle}</strong>" has been automatically cancelled due to the 30-minute timeout.</p>
        <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #111827;">Both parties must confirm within 30 minutes to complete a trade. You can start a new trade from the marketplace.</p>
      `,
      "Browse Marketplace",
      tradeUrl,
    ),
  }),
}
