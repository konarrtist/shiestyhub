import { NextResponse } from "next/server"
import { sendEmail, emailTemplates } from "@/lib/email/resend"

export async function POST(request: Request) {
  try {
    const { email, confirmationUrl, type } = await request.json()

    if (!email || !confirmationUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let emailContent
    switch (type) {
      case "signup":
        emailContent = emailTemplates.confirmSignup(confirmationUrl)
        break
      case "reset_password":
        emailContent = emailTemplates.resetPassword(confirmationUrl)
        break
      case "magic_link":
        emailContent = emailTemplates.magicLink(confirmationUrl)
        break
      case "change_email":
        emailContent = emailTemplates.changeEmail(confirmationUrl)
        break
      case "invite":
        emailContent = emailTemplates.inviteUser(confirmationUrl)
        break
      default:
        emailContent = emailTemplates.confirmSignup(confirmationUrl)
    }

    const result = await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (!result.success) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error sending confirmation email:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
