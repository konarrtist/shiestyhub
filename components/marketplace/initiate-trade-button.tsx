"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface InitiateTradeButtonProps {
  listingId: string
  sellerId: string
  sellerName: string
  listingTitle: string
}

export function InitiateTradeButton({ listingId, sellerId, sellerName, listingTitle }: InitiateTradeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleInitiateTrade = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("You must be logged in")

      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 30)

      // Create transaction with expiry
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: sellerId,
          status: "pending",
          buyer_confirmation: false,
          seller_confirmation: false,
          payment_info: {},
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

      if (txError) throw txError

      // Create transaction log
      await supabase.from("transaction_logs").insert({
        transaction_id: transaction.id,
        user_id: user.id,
        action: "Trade initiated",
        details: {
          listing_id: listingId,
          message: "Buyer initiated trade request",
          expires_at: expiresAt.toISOString(),
        },
      })

      const { data: sellerProfile } = await supabase
        .from("profiles")
        .select("email, display_name")
        .eq("id", sellerId)
        .single()

      const { data: buyerProfile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single()

      if (sellerProfile?.email) {
        await fetch("/api/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "trade_initiated",
            to: sellerProfile.email,
            data: {
              buyerName: buyerProfile?.display_name || "A buyer",
              listingTitle: listingTitle,
              tradeUrl: `https://bunkerfy.top/dashboard/transactions/${transaction.id}`,
            },
          }),
        })
      }

      router.push(`/dashboard/transactions/${transaction.id}`)
    } catch (err) {
      console.error("[v0] Trade initiation error:", err)
      setError(err instanceof Error ? err.message : "Error creating trade")
    } finally {
      setIsLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setShowConfirm(true)}
        disabled={isLoading}
        size="lg"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg h-14"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <MessageSquare className="mr-2 h-5 w-5" />
            Initiate Trade
          </>
        )}
      </Button>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 mt-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Initiate Trade with {sellerName}?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 space-y-2">
              <p>You're about to start a P2P trade. Here's what happens next:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>A trade transaction will be created (expires in 30 minutes)</li>
                <li>You'll arrange payment directly with the seller using their accepted methods</li>
                <li>Once payment is sent, mark it as confirmed</li>
                <li>Seller will deliver the item and confirm</li>
                <li>Both parties must confirm to complete the trade</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-white hover:bg-slate-800">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleInitiateTrade} className="bg-indigo-600 hover:bg-indigo-700">
              Start Trade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
