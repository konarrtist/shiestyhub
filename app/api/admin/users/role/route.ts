import { NextResponse } from "next/server"

import { deriveRole } from "@/lib/utils/roles"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const ALLOWED_ROLES = ["regular", "escrow", "super_admin"]

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, username")
      .eq("id", user.id)
      .single()

    const currentRole = deriveRole({ role: profile?.role, username: profile?.username })

    if (!profile || currentRole !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => null)

    const userId = body?.userId as string | undefined
    const role = body?.role as string | undefined

    if (!userId || !role || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 })
    }

    const { error } = await adminClient.from("profiles").update({ role }).eq("id", userId)

    if (error) {
      console.error("[admin] Failed to update role", error)
      return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[admin] Unexpected role update error", error)
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 })
  }
}
