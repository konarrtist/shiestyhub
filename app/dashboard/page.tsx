import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ArrowRightLeft, Star, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const revalidate = 0
export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get user statistics
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { count: activeListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", user.id)
    .eq("status", "active")

  const { count: activeTransactions } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .in("status", ["pending", "in_progress"])

  const [{ data: ratingValues }, { data: userTransactions }] = await Promise.all([
    supabase.from("reviews").select("rating").eq("reviewed_id", user.id),
    supabase
      .from("transactions")
      .select("status")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`),
  ])

  const averageRating = ratingValues && ratingValues.length > 0
    ? ratingValues.reduce((acc, r) => acc + r.rating, 0) / ratingValues.length
    : 0

  const successfulTrades = userTransactions?.filter((t) => t.status === "completed").length || 0

  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select(`
      *,
      listing:listings(title, blueprint_name),
      buyer:profiles!transactions_buyer_id_fkey(display_name, discord_username),
      seller:profiles!transactions_seller_id_fkey(display_name, discord_username)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(5)

  const stats = [
    {
      title: "Active Listings",
      value: activeListings || 0,
      icon: Package,
      description: "Items for trade",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Active Trades",
      value: activeTransactions || 0,
      icon: ArrowRightLeft,
      description: "In progress",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Reputation",
      value: averageRating.toFixed(1),
      icon: Star,
      description: `${successfulTrades} successful`,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Raider Command</h1>
        <p className="text-slate-400 text-sm sm:text-base">Welcome back to Speranza, {profile?.display_name}</p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-400">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 min-w-0">
        <Card className="bg-slate-900/50 border-slate-800 min-w-0">
          <CardHeader>
            <CardTitle className="text-white text-base sm:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <Link href="/dashboard/my-listings/create" className="block">
              <Button className="w-full justify-start gap-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-sm sm:text-base h-10 sm:h-11">
                <Package className="h-4 w-4" />
                List Item for Trade
              </Button>
            </Link>
            <Link href="/dashboard/marketplace" className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-slate-700 text-white hover:bg-slate-800 bg-transparent text-sm sm:text-base h-10 sm:h-11"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Browse Marketplace
              </Button>
            </Link>
            <Link href="/dashboard/transactions" className="block">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-slate-700 text-white hover:bg-slate-800 bg-transparent text-sm sm:text-base h-10 sm:h-11"
              >
                <AlertTriangle className="h-4 w-4" />
                View Trades
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 min-w-0">
          <CardHeader>
            <CardTitle className="text-white text-base sm:text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions && recentTransactions.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {recentTransactions.map((transaction: any) => (
                  <Link
                    key={transaction.id}
                    href={`/dashboard/transactions/${transaction.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-white truncate">
                        {transaction.listing?.title || "Item removed"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {transaction.buyer_id === user.id ? "Trade with" : "Trade with"}{" "}
                        {transaction.buyer_id === user.id
                          ? transaction.seller?.display_name
                          : transaction.buyer?.display_name}
                      </p>
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <p
                        className={`text-xs sm:text-sm font-semibold capitalize ${
                          transaction.status === "completed"
                            ? "text-emerald-400"
                            : transaction.status === "disputed"
                              ? "text-red-400"
                              : "text-cyan-400"
                        }`}
                      >
                        {transaction.status}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ArrowRightLeft className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No recent trades</p>
                <p className="text-slate-500 text-xs mt-1">Start trading to build your reputation</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-base sm:text-lg">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">What can the escrow team do?</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Escrow can only suspend accounts within this platform and block abusive IPs. The tools do not fully prevent scams, but they drastically reduce risk when combined with the Embark ID reporting system.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">How do I link my in-game account (Embark ID)?</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Use the format <span className="font-mono text-cyan-300">name</span> followed by <span className="font-mono text-cyan-300">#</span> and digits, for example <span className="font-mono text-cyan-300">ooovenenoso#1212</span>. This Embark account is required so other players can find and add you in-game to complete a transaction.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">Can I trade without a linked Embark ID?</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              No. Trades require a linked Embark ID. Keep it visible on your profile so partners can coordinate quickly.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">What happens when someone starts a transaction?</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Once a transaction is started, the item is locked for that buyer until the exchange completes or is canceled—no one else can take it.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-white">Can I review in-game behavior after trading?</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Yes. After a trade you can leave an optional Embark ID report about sportsmanship if you finished a match together. These reports feed the new Embark reputation page and surface on player profiles.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
