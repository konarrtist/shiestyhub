import { NextResponse } from "next/server"
import { deriveRole } from "@/lib/utils/roles"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/admin"

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function validatePayload(body: Record<string, unknown>, requireId: boolean) {
  const name = typeof body.name === "string" ? body.name.trim() : ""
  const category = typeof body.category === "string" ? body.category.trim() : ""
  const rarity = typeof body.rarity === "string" ? body.rarity.trim() : ""
  const icon_url = typeof body.icon_url === "string" ? body.icon_url.trim() : ""
  const id = typeof body.id === "string" ? body.id.trim() : undefined

  if (!name || !category || !rarity) {
    return { error: "Missing required fields" as const }
  }

  if (requireId && (!id || !uuidRegex.test(id))) {
    return { error: "Invalid item id" as const }
  }

  const payload: Record<string, string> = { name, category, rarity }

  if (icon_url) {
    payload.icon_url = icon_url
  }

  if (requireId && id) {
    payload.id = id
  }

  return { payload }
}

async function ensureSuperAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, username")
    .eq("id", user.id)
    .single()

  const role = deriveRole({ role: profile?.role, username: profile?.username })

  if (!profile || role !== "super_admin") {
    return { errorResponse: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { supabase }
}

export async function POST(req: Request) {
  const { errorResponse } = await ensureSuperAdmin()

  if (errorResponse) return errorResponse

  const body = (await req.json().catch(() => null)) || {}

  const { error, payload } = validatePayload(body, false)

  if (error || !payload) {
    return NextResponse.json({ error: error || "Invalid payload" }, { status: 400 })
  }

  const adminClient = createServiceRoleClient()

  const { error: dbError } = await adminClient.from("allowed_items").insert([payload])

  if (dbError) {
    console.error("[admin] Failed to create item", dbError)
    return NextResponse.json({ error: "Failed to create item", details: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function PUT(req: Request) {
  const { errorResponse } = await ensureSuperAdmin()

  if (errorResponse) return errorResponse

  const body = (await req.json().catch(() => null)) || {}

  const { error, payload } = validatePayload(body, true)

  if (error || !payload) {
    return NextResponse.json({ error: error || "Invalid payload" }, { status: 400 })
  }

  const { id, ...updatePayload } = payload

  console.log("[admin] Updating item", { id, updatePayload })

  const adminClient = createServiceRoleClient()

  // Verificar que el item existe primero
  const { data: existingItem, error: checkError } = await adminClient
    .from("allowed_items")
    .select("id")
    .eq("id", id)
    .single()

  if (checkError || !existingItem) {
    console.error("[admin] Item not found", { id, error: checkError })
    return NextResponse.json({ error: "Item not found" }, { status: 404 })
  }

  // Actualizar el item
  const { data, error: dbError } = await adminClient
    .from("allowed_items")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single()

  if (dbError) {
    console.error("[admin] Failed to update item", { id, error: dbError })
    return NextResponse.json({ error: "Failed to update item", details: dbError.message }, { status: 500 })
  }

  console.log("[admin] Item updated successfully", { id, data })

  return NextResponse.json({ success: true, item: data })
}
