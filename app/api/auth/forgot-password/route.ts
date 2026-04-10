import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Generate password reset link using Supabase
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://shiesty.top"}/auth/reset-password`,
    })

    if (error) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ success: true })
    }

    // The reset link is sent by Supabase internally, but we can also send our own
    // For now, we rely on Supabase's built-in reset, but the email template is configured in Supabase dashboard

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error in forgot password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
