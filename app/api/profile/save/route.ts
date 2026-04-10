import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { displayName, bio, avatarUrl, embarkId } = await request.json()

  const admin = createAdminClient()

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("display_name, bio, avatar_url, embark_id")
    .eq("id", user.id)
    .maybeSingle()

  const nextDisplayName = displayName ?? existingProfile?.display_name ?? user.email
  const nextBio = bio ?? existingProfile?.bio ?? null
  const nextAvatarUrl = avatarUrl ?? existingProfile?.avatar_url ?? null
  const nextEmbarkId = embarkId ?? existingProfile?.embark_id ?? null

  const isNewEmbarkLink = Boolean(nextEmbarkId && !existingProfile?.embark_id)

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      display_name: nextDisplayName,
      bio: nextBio,
      avatar_url: nextAvatarUrl,
      embark_id: nextEmbarkId || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  if (isNewEmbarkLink) {
    const webhookUrl = process.env.DISCORD_NEW_WEBHOOK_URL

    if (webhookUrl) {
      const userLabel = nextDisplayName || user.email || "New trader"

      const messages = [
        `${userLabel} linked Embark ID ${nextEmbarkId}. Start scouting trades and send your first offer!`,
        `Embark ID ${nextEmbarkId} is live for ${userLabel}. Time to hunt for trades and lock in a deal.`,
        `${userLabel} is ready to trade with Embark ID ${nextEmbarkId}. Search the marketplace and make a move!`,
        `Embark ID ${nextEmbarkId} connected. ${userLabel}, browse current offers and jump into trading.`,
        `${userLabel} just activated Embark ID ${nextEmbarkId}. Check out ongoing trades and join the action.`,
        `All set! ${userLabel}'s Embark ID ${nextEmbarkId} is verified. Find trades that fit your strategy.`,
        `${userLabel} unlocked Embark ID ${nextEmbarkId}. Explore trade options and start dealing now.`,
      ]

      const payload = {
        embeds: [
          {
            title: "New Embark ID linked",
            description: messages[Math.floor(Math.random() * messages.length)],
            color: 0x5865f2,
          },
        ],
        allowed_mentions: { parse: [] },
      }

      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((error) => {
        console.error("[v0] Embark link webhook error:", error)
      })
    }
  }

  return NextResponse.json({ success: true })
}
