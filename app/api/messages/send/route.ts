import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const transactionId = body?.transactionId as string | undefined
  const receiverId = body?.receiverId as string | undefined
  const content = (body?.content as string | undefined)?.trim()

  if ((!transactionId && !receiverId) || !content) {
    return NextResponse.json({ error: "Missing recipient or message content" }, { status: 400 })
  }

  const admin = createAdminClient()

  let resolvedReceiverId = receiverId || null

  if (transactionId) {
    const { data: transaction, error: txError } = await admin
      .from("transactions")
      .select("id,buyer_id,seller_id")
      .eq("id", transactionId)
      .single()

    if (txError || !transaction) {
      return NextResponse.json({ error: txError?.message || "Transaction not found" }, { status: 404 })
    }

    if (transaction.buyer_id !== user.id && transaction.seller_id !== user.id) {
      return NextResponse.json({ error: "You are not part of this transaction" }, { status: 403 })
    }

    resolvedReceiverId = transaction.buyer_id === user.id ? transaction.seller_id : transaction.buyer_id
  }

  if (!resolvedReceiverId) {
    return NextResponse.json({ error: "Recipient not found" }, { status: 400 })
  }

  if (resolvedReceiverId === user.id) {
    return NextResponse.json({ error: "You cannot message yourself" }, { status: 400 })
  }

  const { data: blockRows } = await admin
    .from("user_blocks")
    .select("blocker_id, blocked_id")
    .or(
      `and(blocker_id.eq.${user.id},blocked_id.eq.${resolvedReceiverId}),and(blocker_id.eq.${resolvedReceiverId},blocked_id.eq.${user.id})`,
    )

  if (blockRows && blockRows.length > 0) {
    return NextResponse.json({ error: "Messaging is blocked for this conversation" }, { status: 403 })
  }

  const { data: insertedMessage, error: insertError } = await admin
    .from("messages")
    .insert({
      transaction_id: transactionId || null,
      sender_id: user.id,
      receiver_id: resolvedReceiverId,
      content,
    })
    .select(
      `id,transaction_id,sender_id,receiver_id,content,created_at,read,
       sender:profiles!messages_sender_id_fkey(id,display_name,discord_avatar)`,
    )
    .single()

  if (insertError || !insertedMessage) {
    console.error("[v0] Message insert error:", insertError)
    return NextResponse.json({ error: insertError?.message || "Unable to send message" }, { status: 400 })
  }

  return NextResponse.json({ message: insertedMessage })
}
