"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart, Loader2 } from "lucide-react"
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

interface BuyButtonProps {
  listingId: string
  sellerId: string
  amount: number
}

export function BuyButton({ listingId, sellerId, amount }: BuyButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handlePurchase = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Debes iniciar sesión")

      // Create transaction
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .insert({
          listing_id: listingId,
          buyer_id: user.id,
          seller_id: sellerId,
          amount: amount,
          status: "pending",
          buyer_confirmation: false,
          seller_confirmation: false,
        })
        .select()
        .single()

      if (txError) throw txError

      // Create transaction log
      await supabase.from("transaction_logs").insert({
        transaction_id: transaction.id,
        user_id: user.id,
        action: "Transaction created",
        details: {
          listing_id: listingId,
          amount: amount,
        },
      })

      router.push(`/dashboard/transactions/${transaction.id}`)
    } catch (err) {
      console.error("Purchase error:", err)
      setError(err instanceof Error ? err.message : "Error al crear la transacción")
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
            Procesando...
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Comprar ahora - ${amount}
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
            <AlertDialogTitle className="text-white">Confirmar Compra</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Estás a punto de iniciar una transacción por ${amount}. El dinero será retenido en escrow hasta que
              confirmes la recepción del blueprint.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-white hover:bg-slate-800">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handlePurchase} className="bg-indigo-600 hover:bg-indigo-700">
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
