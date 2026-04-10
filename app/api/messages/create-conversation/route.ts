import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { recipientId, initialMessage } = await request.json()

    if (!recipientId || !initialMessage?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: existingTransaction } = await supabase
      .from("transactions")
      .select("id,buyer_id,seller_id")
      .or(`and(buyer_id.eq.${user.id},seller_id.eq.${recipientId}),and(buyer_id.eq.${recipientId},seller_id.eq.${user.id})`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Necesitas un trade activo con este usuario para enviar mensajes." },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      transactionId: existingTransaction.id,
    })
  } catch (error: any) {
    console.error("[v0] Create conversation error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
