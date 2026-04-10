import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const extension = file.name.split(".").pop() || "png"
  const filePath = `${user.id}/${Date.now()}.${extension}`

  const admin = createAdminClient()

  const { error: uploadError } = await admin.storage
    .from("profilepic")
    .upload(filePath, file, { cacheControl: "3600", upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 })
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("profilepic").getPublicUrl(filePath)

  return NextResponse.json({ publicUrl })
}
