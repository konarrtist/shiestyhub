"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { CheckCircle, Loader2 } from "lucide-react"

interface TransactionActionsProps {
  transactionId: string
  isBuyer: boolean
  isSeller: boolean
  status: string
  buyerConfirmation: boolean
  sellerConfirmation: boolean
  buyerId: string
  sellerId: string
  buyerName?: string
  sellerName?: string
  blockedByYou?: boolean
  blockedYou?: boolean
  missingEmbarkId?: boolean
  onUpdated?: (
    updates: Partial<{
      buyer_confirmation: boolean
      seller_confirmation: boolean
      status: string
      completed_at?: string
    }>,
  ) => void
}

export function TransactionActions({
  transactionId,
  isBuyer,
  isSeller,
  status,
  buyerConfirmation,
  sellerConfirmation,
  buyerId,
  sellerId,
  buyerName,
  sellerName,
  blockedByYou = false,
  blockedYou = false,
  missingEmbarkId = false,
  onUpdated,
}: TransactionActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setIsLoading(true)
    setActionError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      if (blockedYou) {
        throw new Error("This user blocked you. You can only cancel this trade.")
      }

      if (missingEmbarkId) {
        const { data: profile } = await supabase.from("profiles").select("embark_id").eq("id", user.id).maybeSingle()

        if (!profile?.embark_id) {
          throw new Error("Link your Embark ID before confirming a trade.")
        }
      }

      const { data: transaction } = await supabase
        .from("transactions")
        .select("buyer_confirmation, seller_confirmation, status, listing_id")
        .eq("id", transactionId)
        .single()

      if (!transaction) throw new Error("Transaction not found")

      const nextBuyerConfirmation = isBuyer ? true : transaction.buyer_confirmation
      const nextSellerConfirmation = isSeller ? true : transaction.seller_confirmation
      const nextStatus = nextBuyerConfirmation && nextSellerConfirmation ? "completed" : "in_progress"

      const updates: any = {
        buyer_confirmation: nextBuyerConfirmation,
        seller_confirmation: nextSellerConfirmation,
        status: nextStatus,
      }

      if (nextStatus === "completed") {
        updates.completed_at = new Date().toISOString()
      }

      const { error } = await supabase.from("transactions").update(updates).eq("id", transactionId)

      if (error) throw error

      if (nextStatus === "completed") {
        const { data: listing } = await supabase
          .from("listings")
          .select("title")
          .eq("id", transaction.listing_id)
          .single()

        // Send email to both parties
        await fetch("/api/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "trade_completed",
            buyerId,
            sellerId,
            listingTitle: listing?.title || "Item",
            buyerName,
            sellerName,
          }),
        })
      }

      // Log the action
      await supabase.from("transaction_logs").insert({
        transaction_id: transactionId,
        user_id: user.id,
        action: isBuyer ? "Buyer confirmed" : "Seller confirmed",
        details: {
          confirmation: true,
          status_after: nextStatus,
        },
      })

      const recipients = new Set<string>()
      const actorName = isBuyer ? buyerName || "Buyer" : sellerName || "Seller"

      if (isBuyer && sellerId) recipients.add(sellerId)
      if (isSeller && buyerId) recipients.add(buyerId)
      if (nextStatus === "completed") {
        if (buyerId) recipients.add(buyerId)
        if (sellerId) recipients.add(sellerId)
      }

      const title = nextStatus === "completed" ? "Trade completed" : `${actorName} confirmed`
      const message =
        nextStatus === "completed"
          ? "Both parties confirmed the trade."
          : `${actorName} confirmó su parte del intercambio.`

      if (recipients.size > 0) {
        await supabase.from("notifications").insert(
          Array.from(recipients).map((recipientId) => ({
            user_id: recipientId,
            type: "transaction",
            title,
            message,
            link: `/dashboard/transactions/${transactionId}`,
          })),
        )
      }

      onUpdated?.({
        buyer_confirmation: nextBuyerConfirmation,
        seller_confirmation: nextSellerConfirmation,
        status: nextStatus,
        completed_at: updates.completed_at,
      })
    } catch (err) {
      console.error("Confirm error:", err)
      setActionError(err instanceof Error ? err.message : "Unable to update trade status")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    setActionError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")
      if (!isBuyer && !isSeller) throw new Error("Only participants can cancel trades")

      const { data: transaction } = await supabase
        .from("transactions")
        .select("status, listing_id")
        .eq("id", transactionId)
        .single()

      if (!transaction) throw new Error("Transaction not found")
      if (["completed", "cancelled", "disputed"].includes(transaction.status)) {
        throw new Error("This trade can no longer be cancelled")
      }

      const { error } = await supabase.from("transactions").update({ status: "cancelled" }).eq("id", transactionId)

      if (error) throw error

      const { data: listing } = await supabase
        .from("listings")
        .select("title")
        .eq("id", transaction.listing_id)
        .single()

      const otherPartyId = isBuyer ? sellerId : buyerId
      const actorName = isBuyer ? buyerName || "Buyer" : sellerName || "Seller"

      await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "trade_cancelled",
          recipientId: otherPartyId,
          cancellerName: actorName,
          listingTitle: listing?.title || "Item",
          transactionId,
        }),
      })

      await supabase.from("transaction_logs").insert({
        transaction_id: transactionId,
        user_id: user.id,
        action: "Trade cancelled",
        details: { status_after: "cancelled" },
      })

      if (otherPartyId) {
        await supabase.from("notifications").insert({
          user_id: otherPartyId,
          type: "transaction",
          title: "Trade cancelled",
          message: `${actorName} cancelled this trade.`,
          link: `/dashboard/transactions/${transactionId}`,
        })
      }

      onUpdated?.({ status: "cancelled" })
    } catch (err) {
      console.error("Cancel error:", err)
      setActionError(err instanceof Error ? err.message : "Unable to cancel this trade")
    } finally {
      setIsCancelling(false)
    }
  }

  const alreadyConfirmedByUser = (isBuyer && buyerConfirmation) || (isSeller && sellerConfirmation)
  const needsFinalization = buyerConfirmation && sellerConfirmation && status !== "completed"
  const canConfirmBase = (!alreadyConfirmedByUser && (isBuyer || isSeller)) || needsFinalization
  const confirmDisabledReason = blockedYou
    ? "This user blocked you. Cancel or ask them to unblock you."
    : blockedByYou
      ? "You blocked this user. Unblock them to continue."
      : missingEmbarkId
        ? "Link your Embark ID before confirming this trade."
        : null
  const confirmDisabled = !canConfirmBase || isLoading || isCancelling || !!confirmDisabledReason
  const cancelDisabled =
    isCancelling || isLoading || status === "completed" || status === "cancelled" || status === "disputed"

  const infoMessage =
    confirmDisabledReason ||
    (alreadyConfirmedByUser
      ? needsFinalization
        ? "Waiting to finalize your partner's confirmation."
        : "You already confirmed this trade."
      : null)

  return (
    <div className="space-y-3">
      {infoMessage && (
        <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-center text-sm text-slate-100">
          {infoMessage}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          onClick={handleConfirm}
          disabled={confirmDisabled}
          size="lg"
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {needsFinalization ? "Finalizing..." : "Confirming..."}
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              {needsFinalization ? "Finalize trade" : isBuyer ? "Confirm Delivery" : "Confirm Handover"}
            </>
          )}
        </Button>
        <Button
          onClick={handleCancel}
          disabled={cancelDisabled}
          variant="outline"
          size="lg"
          className="w-full border-slate-700 text-white hover:bg-slate-800 bg-transparent"
        >
          {isCancelling ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Cancelling...
            </>
          ) : (
            "Cancel trade"
          )}
        </Button>
      </div>
      {actionError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-100">{actionError}</div>
      )}
    </div>
  )
}

export default TransactionActions
