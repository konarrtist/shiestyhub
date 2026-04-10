import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Package } from "lucide-react"

export default async function TransactionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      *,
      listing:listings(title, blueprint_name),
      buyer:profiles!transactions_buyer_id_fkey(display_name),
      seller:profiles!transactions_seller_id_fkey(display_name)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    in_progress: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    disputed: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  }

  return (
    <div className="space-y-6 p-4 md:p-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">My Trades</h1>
        <p className="text-slate-400 mt-1">Complete history of your Rust Belt transactions</p>
      </div>

      <div className="space-y-3">
        {transactions?.map((transaction: any) => (
          <Link key={transaction.id} href={`/dashboard/transactions/${transaction.id}`}>
            <Card className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/30 transition-colors cursor-pointer">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="bg-cyan-500/10 p-3 rounded-lg w-fit">
                    <Package className="h-5 w-5 md:h-6 md:w-6 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-base md:text-lg truncate">
                      {transaction.listing?.title || "Listing removed"}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {transaction.buyer_id === user.id ? "Traded with" : "Sold to"}{" "}
                      {transaction.buyer_id === user.id
                        ? transaction.seller?.display_name
                        : transaction.buyer?.display_name}
                    </p>
                  </div>
                  <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                    <Badge className={`${statusColors[transaction.status]} border capitalize text-xs`}>
                      {transaction.status.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {!transactions ||
        (transactions.length === 0 && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="py-12 md:py-16 text-center">
              <Package className="h-12 w-12 md:h-16 md:w-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2">No trades yet</h3>
              <p className="text-slate-400 text-sm md:text-base">Start trading in the Speranza marketplace</p>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
