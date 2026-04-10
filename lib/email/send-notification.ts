import { sendEmail, emailTemplates } from "./resend"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bunkerfy.top"

export async function notifyTradeInitiated(
  sellerEmail: string,
  buyerName: string,
  listingTitle: string,
  transactionId: string,
) {
  const { subject, html } = emailTemplates.tradeInitiated(
    buyerName,
    listingTitle,
    `${BASE_URL}/dashboard/transactions/${transactionId}`,
  )
  return sendEmail({ to: sellerEmail, subject, html })
}

export async function notifyTradeCompleted(
  userEmail: string,
  partnerName: string,
  listingTitle: string,
  partnerId: string,
) {
  const { subject, html } = emailTemplates.tradeCompleted(
    partnerName,
    listingTitle,
    `${BASE_URL}/dashboard/profile/${partnerId}`,
  )
  return sendEmail({ to: userEmail, subject, html })
}

export async function notifyNewMessage(
  recipientEmail: string,
  senderName: string,
  messagePreview: string,
  transactionId: string,
) {
  const { subject, html } = emailTemplates.newMessage(
    senderName,
    messagePreview.substring(0, 100) + (messagePreview.length > 100 ? "..." : ""),
    `${BASE_URL}/dashboard/messages?transaction=${transactionId}`,
  )
  return sendEmail({ to: recipientEmail, subject, html })
}

export async function notifyReportReceived(reporterEmail: string, reportId: string, reportedUser: string) {
  const { subject, html } = emailTemplates.reportReceived(reportId, reportedUser)
  return sendEmail({ to: reporterEmail, subject, html })
}

export async function notifyAccountBanned(userEmail: string, reason: string) {
  const { subject, html } = emailTemplates.accountBanned(reason)
  return sendEmail({ to: userEmail, subject, html })
}

export async function notifyTradeCancelled(
  userEmail: string,
  cancellerName: string,
  listingTitle: string,
  transactionId: string,
) {
  const { subject, html } = emailTemplates.tradeCancelled(
    cancellerName,
    listingTitle,
    `${BASE_URL}/dashboard/transactions/${transactionId}`,
  )
  return sendEmail({ to: userEmail, subject, html })
}

export async function notifyTradeExpired(userEmail: string, listingTitle: string, transactionId: string) {
  const { subject, html } = emailTemplates.tradeExpired(
    listingTitle,
    `${BASE_URL}/dashboard/transactions/${transactionId}`,
  )
  return sendEmail({ to: userEmail, subject, html })
}
