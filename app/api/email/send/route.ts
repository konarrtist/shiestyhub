import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail, emailTemplates } from "@/lib/email/resend"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, to, data } = body

    if (!type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let emailContent: { subject: string; html: string } | null = null
    let recipientEmail = to

    switch (type) {
      case "trade_initiated":
        emailContent = emailTemplates.tradeInitiated(data.buyerName, data.listingTitle, data.tradeUrl)
        break

      case "trade_completed":
        // Get both buyer and seller emails
        if (data.buyerId && data.sellerId) {
          const { data: buyerProfile } = await supabase.from("profiles").select("email").eq("id", data.buyerId).single()

          const { data: sellerProfile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", data.sellerId)
            .single()

          const emails = [buyerProfile?.email, sellerProfile?.email].filter(Boolean) as string[]

          if (emails.length > 0) {
            emailContent = emailTemplates.tradeCompleted(
              data.buyerName || data.sellerName || "your partner",
              data.listingTitle,
              data.profileUrl || "https://shiesty.top/dashboard/transactions",
            )

            // Send to both parties
            for (const email of emails) {
              await sendEmail({
                to: email,
                subject: emailContent.subject,
                html: emailContent.html,
              })
            }

            return NextResponse.json({ success: true })
          }
        }
        break

      case "trade_cancelled":
        if (data.recipientId) {
          const { data: profile } = await supabase.from("profiles").select("email").eq("id", data.recipientId).single()

          if (profile?.email) {
            recipientEmail = profile.email
            emailContent = emailTemplates.tradeCancelled(
              data.cancellerName || "A trader",
              data.listingTitle,
              `https://shiesty.top/dashboard/transactions/${data.transactionId}`,
            )
          }
        }
        break

      case "trade_expired":
        if (data.buyerId && data.sellerId) {
          const { data: buyerProfile } = await supabase.from("profiles").select("email").eq("id", data.buyerId).single()

          const { data: sellerProfile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", data.sellerId)
            .single()

          const emails = [buyerProfile?.email, sellerProfile?.email].filter(Boolean) as string[]

          if (emails.length > 0) {
            emailContent = emailTemplates.tradeExpired(data.listingTitle, "https://shiesty.top/dashboard/marketplace")

            // Send to both parties
            for (const email of emails) {
              await sendEmail({
                to: email,
                subject: emailContent.subject,
                html: emailContent.html,
              })
            }

            return NextResponse.json({ success: true })
          }
        }
        break

      case "new_message":
        emailContent = emailTemplates.newMessage(data.senderName, data.preview, data.messagesUrl)
        break

      case "report_received":
        emailContent = emailTemplates.reportReceived(data.reportId, data.reportedUser)
        break

      case "account_banned":
        emailContent = emailTemplates.accountBanned(data.reason)
        break

      default:
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 })
    }

    if (!emailContent) {
      return NextResponse.json({ error: "Failed to generate email" }, { status: 400 })
    }

    if (!recipientEmail) {
      return NextResponse.json({ error: "No recipient email found" }, { status: 400 })
    }

    const result = await sendEmail({
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (!result.success) {
      console.error("[Email API] Failed to send:", result.error)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error("[Email API] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
