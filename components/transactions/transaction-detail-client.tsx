"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/ui/user-avatar"
import { DisputeButton } from "./dispute-button"
import { Clock, CheckCircle2, AlertCircle, MessageSquare, ShieldCheck } from "lucide-react"
import TransactionActions from "./transaction-actions"
import ReviewForm from "@/components/reviews/review-form"
import { EmbarkReportForm } from "@/components/reports/embark-report-form"
import { Button } from "@/components/ui/button"

interface UserTradeStats {
  averageRating: number
  successRate: number
  totalTrades: number
  successfulTrades: number
  failedTrades: number
}

interface TransactionDetailClientProps {
  transaction: any
  buyerStats: UserTradeStats
  sellerStats: UserTradeStats
  existingReview: { id: string; rating: number; comment: string | null } | null
  existingEmbarkReport: {
    id: string
    rating: number | null
    comment: string | null
    reason: string
    status?: string | null
    embark_id?: string | null
    reported_embark_id?: string | null
  } | null
  isBuyer: boolean
  isSeller: boolean
  counterpartyEmbarkId?: string | null
  viewerEmbarkId?: string | null
  blockStatus?: { blockedByYou: boolean; blockedYou: boolean }
  logs: any[]
  userId: string
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  disputed: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20",
}

export default function TransactionDetailClient({
  transaction,
  buyerStats,
  sellerStats,
  existingReview,
  existingEmbarkReport,
  isBuyer,
  isSeller,
  counterpartyEmbarkId,
  viewerEmbarkId,
  blockStatus,
  logs,
  userId,
}: TransactionDetailClientProps) {
  const supabase = createClient()
  const [currentTransaction, setCurrentTransaction] = useState(transaction)
  const [transactionLogs, setTransactionLogs] = useState(logs)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState(false)
  const isParticipant = useMemo(() => isBuyer || isSeller, [isBuyer, isSeller])
  const viewerEmbarkValue = useMemo(() => {
    if (isBuyer) return currentTransaction.buyer?.embark_id
    if (isSeller) return currentTransaction.seller?.embark_id
    return viewerEmbarkId
  }, [currentTransaction, isBuyer, isSeller, viewerEmbarkId])
  const missingEmbarkId = useMemo(() => !viewerEmbarkValue, [viewerEmbarkValue])
  const isBlocked = useMemo(() => blockStatus?.blockedByYou || blockStatus?.blockedYou || false, [blockStatus])
  const blockMessage = useMemo(() => {
    if (blockStatus?.blockedYou) {
      return "This trade partner blocked you. Only cancellation is available."
    }

    if (blockStatus?.blockedByYou) {
      return "You blocked this user. Unblock them if you want to continue this trade."
    }

    return null
  }, [blockStatus])
  const audioContextRef = useRef<AudioContext | null>(null)

  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      const ctx = audioContextRef.current || new AudioCtx()
      audioContextRef.current = ctx

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.type = "sine"
      oscillator.frequency.value = 880
      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.start()
      oscillator.stop(ctx.currentTime + 0.35)
    } catch (error) {
      console.error("[v0] Notification sound error:", error)
    }
  }

  const refreshTransaction = async () => {
    setIsRefreshing(true)
    const { data } = await supabase
      .from("transactions")
      .select(`
        *,
        listing:listings(title, blueprint_name, blueprint_rarity, description, items_offered, items_wanted),
        buyer:profiles!transactions_buyer_id_fkey(id, display_name, discord_username, discord_avatar, avatar_url, rating, embark_id, last_seen, is_online),
        seller:profiles!transactions_seller_id_fkey(id, display_name, discord_username, discord_avatar, avatar_url, rating, embark_id, last_seen, is_online),
        escrow:profiles!transactions_escrow_id_fkey(id, display_name, discord_avatar, avatar_url)
      `)
      .eq("id", transaction.id)
      .maybeSingle()

    if (data) {
      setCurrentTransaction(data)
    }
    setIsRefreshing(false)
  }

  useEffect(() => {
    const channel = supabase
      .channel(`transaction-${transaction.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "transactions", filter: `id=eq.${transaction.id}` },
        async () => {
          playNotificationSound()
          await refreshTransaction()
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transaction_logs", filter: `transaction_id=eq.${transaction.id}` },
        async (payload) => {
          const { data } = await supabase
            .from("transaction_logs")
            .select("*, user:profiles(display_name, discord_avatar, avatar_url, id)")
            .eq("id", (payload as any).new.id)
            .maybeSingle()

          if (data) {
            setTransactionLogs((prev) => [data, ...prev.filter((log) => log.id !== data.id)])
          }
          playNotificationSound()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      audioContextRef.current?.close()
    }
  }, [supabase, transaction.id])

  useEffect(() => {
    if (
      !currentTransaction.expires_at ||
      currentTransaction.status === "completed" ||
      currentTransaction.status === "cancelled"
    ) {
      return
    }

    const calculateTimeLeft = () => {
      const expiresAt = new Date(currentTransaction.expires_at).getTime()
      const now = Date.now()
      const diff = expiresAt - now

      if (diff <= 0) {
        setIsExpired(true)
        setTimeLeft("Expired")
        return
      }

      const minutes = Math.floor((diff / 1000 / 60) % 60)
      const seconds = Math.floor((diff / 1000) % 60)
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`)
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [currentTransaction.expires_at, currentTransaction.status])

  const steps = useMemo(
    () => [
      { label: "Trade Initiated", status: "completed" as const },
      {
        label: "Awaiting Confirmation",
        status: currentTransaction.status === "pending" ? ("current" as const) : ("completed" as const),
      },
      {
        label: "In-Game Trade",
        status:
          currentTransaction.status === "in_progress"
            ? ("current" as const)
            : currentTransaction.status === "completed"
              ? ("completed" as const)
              : ("pending" as const),
      },
      {
        label: "Completed",
        status: currentTransaction.status === "completed" ? ("completed" as const) : ("pending" as const),
      },
    ],
    [currentTransaction.status],
  )

  const renderItems = (items: any[], label: string) => {
    if (!items || items.length === 0) return null

    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <div className="flex flex-wrap gap-2">
          {items.map((item: any, index: number) => (
            <div key={index} className="relative group">
              <img
                src={item.icon_url || "/placeholder.svg"}
                alt={item.name}
                className="w-12 h-12 rounded border border-slate-700 bg-slate-800"
              />
              {item.quantity && item.quantity > 1 && (
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {item.quantity}
                </span>
              )}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {item.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderListingItem = () => {
    const listing = currentTransaction.listing
    if (!listing || !listing.blueprint_name) return null

    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-400">Trading Item</p>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="relative">
            <img
              src={listing.item_icon_url || "/placeholder.svg"}
              alt={listing.blueprint_name}
              className="w-16 h-16 rounded border border-slate-700 bg-slate-800 object-contain"
            />
            {listing.quantity && listing.quantity > 1 && (
              <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {listing.quantity}
              </span>
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">{listing.blueprint_name}</p>
            {listing.blueprint_rarity && (
              <p className="text-xs text-slate-400 capitalize">{listing.blueprint_rarity}</p>
            )}
            {listing.title && listing.title !== listing.blueprint_name && (
              <p className="text-xs text-slate-500 mt-0.5">{listing.title}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderParticipant = (
    role: string,
    participant: any,
    stats: UserTradeStats,
    confirmed: boolean,
    badgeColor: string,
  ) => (
    <div className="p-4 rounded-lg bg-slate-900/50">
      <p className="text-xs text-slate-400 mb-3">{role}</p>
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/profile/${participant.id}`} className="shrink-0">
          <UserAvatar
            user={{
              id: participant.id,
              display_name: participant.display_name,
              avatar_url: participant.avatar_url,
              discord_avatar: participant.discord_avatar,
              last_seen: participant.last_seen,
              is_online: participant.is_online,
            }}
            size="md"
            showOnlineStatus
          />
        </Link>
        <div className="flex-1 min-w-0 space-y-1">
          <Link
            href={`/dashboard/profile/${participant.id}`}
            className="font-medium text-white truncate text-sm sm:text-base hover:text-cyan-200"
          >
            {participant.display_name}
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-amber-400" />
              {stats.averageRating.toFixed(1)} rating
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              {stats.successRate}% success
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-cyan-400" />
              {stats.totalTrades} trades
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">Embark ID: {participant.embark_id || "Not linked"}</p>
        </div>
        {confirmed && <Badge className={`${badgeColor} text-xs shrink-0`}>Confirmed</Badge>}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Trade Details</h1>
          <p className="text-slate-400 mt-1 text-sm">ID: {currentTransaction.id.slice(0, 8)}...</p>
        </div>
        <div className="flex items-center gap-2">
          {timeLeft &&
            !isExpired &&
            currentTransaction.status !== "completed" &&
            currentTransaction.status !== "cancelled" && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-mono text-amber-200">{timeLeft}</span>
              </div>
            )}
          {isExpired && <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Expired</Badge>}
          {isRefreshing && <Clock className="h-4 w-4 text-cyan-400 animate-spin" />}
          <Badge
            className={`${statusColors[currentTransaction.status]} border capitalize text-sm sm:text-base px-3 sm:px-4 py-1 w-fit`}
          >
            {currentTransaction.status}
          </Badge>
        </div>
      </div>

      <Card className="bg-slate-900/50 border-slate-800 overflow-x-auto">
        <CardContent className="pt-6 min-w-[600px] sm:min-w-0">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 ${
                      step.status === "completed"
                        ? "bg-emerald-500 border-emerald-500"
                        : step.status === "current"
                          ? "bg-cyan-500 border-cyan-500"
                          : "bg-slate-800 border-slate-700"
                    }`}
                  >
                    {(step.status === "completed" || (step.status === "current" && index === steps.length - 1)) && (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </div>
                  <p
                    className={`text-xs mt-2 text-center ${step.status !== "pending" ? "text-white" : "text-slate-500"}`}
                  >
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 -mx-2 ${
                      steps[index + 1].status === "completed" || steps[index + 1].status === "current"
                        ? "bg-emerald-500"
                        : "bg-slate-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800 border-cyan-500/30">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-cyan-400">How this trade works</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                This is a direct peer-to-peer trade. Meet in-game using your Embark IDs to complete the exchange. The
                escrow team <strong className="text-slate-300">does not hold items or money</strong> — they only have
                the power to ban accounts and IPs if scams are reported. Use the Embark ID review system to help the
                community identify trustworthy traders.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base sm:text-lg">Trade Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {renderListingItem()}

              {currentTransaction.listing && (
                <div className="p-3 rounded-lg bg-slate-800/50 space-y-3">
                  {renderItems(currentTransaction.listing.items_offered, "Offering")}
                  {renderItems(currentTransaction.listing.items_wanted, "Wants")}
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                <Clock className="h-5 w-5 text-orange-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-slate-400">Date</p>
                  <p className="font-medium text-white text-sm">
                    {new Date(currentTransaction.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50">
                <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400">Dispute Support</p>
                  <p className="font-medium text-white text-sm">Escrow team available if issues arise</p>
                  <p className="text-[10px] text-slate-500 mt-1">Can ban scammers but does not hold items</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base sm:text-lg">Trade Participants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderParticipant(
              "Buyer",
              currentTransaction.buyer,
              buyerStats,
              currentTransaction.buyer_confirmation,
              "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            )}
            {renderParticipant(
              "Seller",
              currentTransaction.seller,
              sellerStats,
              currentTransaction.seller_confirmation,
              "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            )}
          </CardContent>
        </Card>
      </div>

      {isParticipant && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <Link href={`/dashboard/messages?transaction=${currentTransaction.id}`}>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {isParticipant && currentTransaction.status !== "completed" && currentTransaction.status !== "cancelled" && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base sm:text-lg">Trade Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(missingEmbarkId || blockMessage) && (
              <div className="p-3 sm:p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 space-y-1">
                <p className="text-sm font-semibold text-amber-200">Action needed</p>
                {blockMessage ? (
                  <p className="text-xs text-amber-100">{blockMessage}</p>
                ) : (
                  <p className="text-xs text-amber-100">
                    Link your Embark ID before confirming or messaging. Trades stay locked until your ID is connected.
                  </p>
                )}
                {missingEmbarkId && (
                  <Link href="/dashboard/link-username" className="text-xs text-amber-100 underline hover:text-white">
                    Link Embark ID
                  </Link>
                )}
              </div>
            )}
            <TransactionActions
              transactionId={currentTransaction.id}
              isBuyer={isBuyer}
              isSeller={isSeller}
              status={currentTransaction.status}
              buyerConfirmation={currentTransaction.buyer_confirmation}
              sellerConfirmation={currentTransaction.seller_confirmation}
              buyerId={currentTransaction.buyer_id}
              sellerId={currentTransaction.seller_id}
              buyerName={currentTransaction.buyer?.display_name}
              sellerName={currentTransaction.seller?.display_name}
              blockedByYou={blockStatus?.blockedByYou || false}
              blockedYou={blockStatus?.blockedYou || false}
              missingEmbarkId={missingEmbarkId}
              onUpdated={(updates) => setCurrentTransaction((prev: any) => ({ ...prev, ...updates }))}
            />

            {currentTransaction.status !== "disputed" && (
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                  <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-400">Trade Issues?</p>
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                      If you encounter a scammer, open a dispute. Our escrow team can ban their account and IP from the
                      platform, helping protect other traders. Note: We cannot recover lost items.
                    </p>
                  </div>
                </div>

                <DisputeButton transactionId={currentTransaction.id} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {transactionLogs && transactionLogs.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactionLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <Clock className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <p className="font-medium text-white break-words">{log.action}</p>
                      <span className="text-xs text-slate-500">•</span>
                      <p className="text-sm text-slate-400 break-words">{log.user?.display_name}</p>
                    </div>
                    <p className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</p>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <pre className="text-xs text-slate-400 mt-2 p-2 rounded bg-slate-900/50 overflow-auto whitespace-pre-wrap break-words max-w-full">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isParticipant && currentTransaction.status === "completed" && !currentTransaction.disputed_by && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base sm:text-lg">Share Your Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-white">Trade review</p>
              <ReviewForm
                transactionId={currentTransaction.id}
                reviewedId={isBuyer ? currentTransaction.seller_id : currentTransaction.buyer_id}
                reviewedName={isBuyer ? currentTransaction.seller.display_name : currentTransaction.buyer.display_name}
                existingReview={existingReview}
              />
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div>
                <p className="text-sm font-semibold text-white">Embark ID report (optional)</p>
                <p className="text-xs text-slate-400 mt-1">
                  If you finished a match together, leave an in-game behavior report automatically tied to their linked
                  Embark ID so others understand how they play.
                </p>
              </div>
              <EmbarkReportForm
                transactionId={currentTransaction.id}
                reportedId={isBuyer ? currentTransaction.seller_id : currentTransaction.buyer_id}
                existingReport={existingEmbarkReport}
                defaultEmbarkId={counterpartyEmbarkId}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { TransactionDetailClient }
