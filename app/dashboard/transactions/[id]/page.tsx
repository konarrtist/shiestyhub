import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { TransactionDetailClient } from "@/components/transactions/transaction-detail-client"

export const revalidate = 0

type UserTradeStats = {
  averageRating: number
  successRate: number
  totalTrades: number
  successfulTrades: number
  failedTrades: number
}

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: transaction } = await supabase
    .from("transactions")
    .select(`
      *,
      listing:listings(title, blueprint_name, blueprint_rarity, description),
      buyer:profiles!transactions_buyer_id_fkey(id, display_name, discord_username, discord_avatar, avatar_url, rating, embark_id),
      seller:profiles!transactions_seller_id_fkey(id, display_name, discord_username, discord_avatar, avatar_url, rating, embark_id),
      escrow:profiles!transactions_escrow_id_fkey(id, display_name, discord_avatar, avatar_url)
    `)
    .eq("id", id)
    .single()

  if (!transaction) {
    notFound()
  }

  const isBuyer = transaction.buyer_id === user.id
  const isSeller = transaction.seller_id === user.id
  const isParticipant = isBuyer || isSeller
  const counterpartyId = isBuyer ? transaction.seller_id : transaction.buyer_id

  if (!isParticipant) {
    redirect("/dashboard")
  }

  const [{ data: existingReview }, { data: existingEmbarkReport }] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, rating, comment")
      .eq("transaction_id", id)
      .eq("reviewer_id", user.id)
      .maybeSingle(),
    supabase
      .from("embark_reports")
      .select("id, rating, comment, reason, status, embark_id, reported_embark_id")
      .eq("transaction_id", id)
      .eq("reporter_id", user.id)
      .maybeSingle(),
  ])

  const [buyerStats, sellerStats, { data: logs }] = await Promise.all([
    getUserStats(transaction.buyer_id, supabase),
    getUserStats(transaction.seller_id, supabase),
    supabase
      .from("transaction_logs")
      .select(`*, user:profiles(display_name, discord_avatar, avatar_url, id)`) // id for sorting on client updates
      .eq("transaction_id", id)
      .order("created_at", { ascending: false }),
  ])

  const { data: blockRows } = await supabase
    .from("user_blocks")
    .select("blocker_id, blocked_id")
    .or(
      `and(blocker_id.eq.${user.id},blocked_id.eq.${counterpartyId}),and(blocker_id.eq.${counterpartyId},blocked_id.eq.${user.id})`,
    )

  const blockStatus = {
    blockedByYou: blockRows?.some((entry) => entry.blocker_id === user.id && entry.blocked_id === counterpartyId) || false,
    blockedYou: blockRows?.some((entry) => entry.blocker_id === counterpartyId && entry.blocked_id === user.id) || false,
  }

  return (
    <TransactionDetailClient
      transaction={transaction}
      buyerStats={buyerStats}
      sellerStats={sellerStats}
      existingReview={existingReview || null}
      existingEmbarkReport={existingEmbarkReport || null}
      isBuyer={isBuyer}
      isSeller={isSeller}
      counterpartyEmbarkId={isBuyer ? transaction.seller?.embark_id : transaction.buyer?.embark_id}
      viewerEmbarkId={isBuyer ? transaction.buyer?.embark_id : transaction.seller?.embark_id}
      blockStatus={blockStatus}
      logs={logs || []}
    />
  )
}

async function getUserStats(
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<UserTradeStats> {
  const [{ data: ratingValues }, { data: transactions }] = await Promise.all([
    supabase.from("reviews").select("rating").eq("reviewed_id", userId),
    supabase
      .from("transactions")
      .select("status")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`),
  ])

  const averageRating = ratingValues && ratingValues.length > 0
    ? ratingValues.reduce((acc, r) => acc + r.rating, 0) / ratingValues.length
    : 0

  const totalTrades = transactions?.length || 0
  const successfulTrades = transactions?.filter((t) => t.status === "completed").length || 0
  const failedTrades = transactions?.filter((t) => t.status === "cancelled" || t.status === "disputed").length || 0
  const successRate = totalTrades > 0 ? Math.round((successfulTrades / totalTrades) * 100) : 0

  return {
    averageRating,
    successRate,
    totalTrades,
    successfulTrades,
    failedTrades,
  }
}
