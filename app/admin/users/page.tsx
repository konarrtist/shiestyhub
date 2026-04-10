import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Shield, Crown } from "lucide-react"
import { UserRoleSelector } from "@/components/admin/user-role-selector"
import { deriveRole } from "@/lib/utils/roles"

export default async function AdminUsersPage() {
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

  const { data: users } = await supabase
    .from("profiles")
    .select("id, display_name, discord_username, username, discord_avatar, avatar_url, role, rating, total_trades, successful_trades, failed_trades, created_at")
    .order("created_at", { ascending: false })

  const roleIcons = {
    regular: User,
    escrow: Shield,
    super_admin: Crown,
  }

  const roleColors = {
    regular: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    escrow: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    super_admin: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  }

  const getNumericValue = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return 0
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const getSuccessRate = (successful: number, total: number) => {
    if (total === 0) return 0
    return Math.round((successful / total) * 100)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-slate-400 mt-1">Review user stats and manage access</p>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users?.map((userData: any) => {
              const role = (userData.role || "regular") as keyof typeof roleIcons
              const RoleIcon = roleIcons[role] || User
              const totalTrades = getNumericValue(userData.total_trades)
              const successfulTrades = getNumericValue(userData.successful_trades)
              const failedTrades = getNumericValue(userData.failed_trades)
              const successRate = getSuccessRate(successfulTrades, totalTrades)
              const rating = getNumericValue(userData.rating)
              const badgeStyle = roleColors[role] || roleColors.regular

              return (
                <div
                  key={userData.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={(userData as any).avatar_url || userData.discord_avatar || undefined} />
                    <AvatarFallback className="bg-indigo-600 text-white">
                      {userData.display_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white truncate">{userData.display_name}</p>
                      <RoleIcon className="h-4 w-4 text-slate-400 shrink-0" />
                    </div>
                    <p className="text-sm text-slate-400 truncate">{userData.discord_username || "No Discord connected"}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                      <span>Rating: {rating > 0 ? rating.toFixed(1) : "0.0"}</span>
                      <span>Success rate: {successRate}%</span>
                      <span>{totalTrades} trades</span>
                      <span>Won: {successfulTrades}</span>
                      <span>Lost: {failedTrades}</span>
                      <span>Joined {new Date(userData.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={`${badgeStyle} border capitalize`}>
                      {role === "super_admin" ? "Admin" : role}
                    </Badge>
                    <UserRoleSelector userId={userData.id} currentRole={role} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
