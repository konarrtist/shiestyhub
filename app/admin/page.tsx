export const runtime = 'edge';
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, ArrowLeftRight, AlertTriangle, TrendingUp, Shield } from "lucide-react"
import { deriveRole } from "@/lib/utils/roles"

export const revalidate = 0
export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, role")
    .eq("id", user.id)
    .single()

  const userRole = deriveRole({ role: profile?.role, username: profile?.username })

  if (!profile || userRole !== "super_admin") {
    redirect("/dashboard")
  }

  // Get statistics
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: activeListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  const { count: totalTransactions } = await supabase.from("transactions").select("*", { count: "exact", head: true })

  const { count: openDisputes } = await supabase
    .from("disputes")
    .select("*", { count: "exact", head: true })
    .in("status", ["open", "in_review"])

  const { count: completedTrades } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed")

  const stats = [
    {
      title: "Total Raiders",
      value: totalUsers || 0,
      icon: Users,
      description: "Registered in Speranza",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Active Listings",
      value: activeListings || 0,
      icon: Package,
      description: "Available for trade",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Total Trades",
      value: totalTransactions || 0,
      icon: ArrowLeftRight,
      description: "All transactions",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Active Disputes",
      value: openDisputes || 0,
      icon: AlertTriangle,
      description: "Needs attention",
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
    },
    {
      title: "Completed",
      value: completedTrades || 0,
      icon: TrendingUp,
      description: "Successful trades",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
  ]

  // Get recent activity
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select(`
      *,
      listing:listings(title),
      buyer:profiles!transactions_buyer_id_fkey(display_name),
      seller:profiles!transactions_seller_id_fkey(display_name)
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6 p-4 md:p-0">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-orange-600 to-orange-500 p-3 rounded-xl">
          <Shield className="h-5 w-5 md:h-6 md:w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Command Center</h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">Speranza platform overview</p>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
              <CardTitle className="text-xs md:text-sm font-medium text-slate-400">{stat.title}</CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <stat.icon className={`h-3 w-3 md:h-4 md:w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-xl md:text-3xl font-bold text-white">{stat.value}</div>
              <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-white text-base md:text-lg">Recent Raiders</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-3">
              {recentUsers?.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{user.display_name}</p>
                    <p className="text-xs text-slate-400 capitalize">
                      Role: {user.role === "super_admin" ? "Admin" : user.role}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs text-slate-500">{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-white text-base md:text-lg">Recent Trades</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-3">
              {recentTransactions?.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">
                      {transaction.listing?.title || "Listing removed"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {transaction.buyer?.display_name} ↔ {transaction.seller?.display_name}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs text-slate-500 capitalize">{transaction.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
