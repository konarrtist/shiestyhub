import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp, Package, ArrowRightLeft, Calendar, Shield, Crown, User } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { deriveRole } from "@/lib/utils/roles"
import { BlockUserButton } from "@/components/profile/block-user-button"
import { SendMessageButton } from "@/components/profile/send-message-button"

export const revalidate = 0

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single()

  if (!profile) {
    redirect("/dashboard/profile")
  }

  const derivedRole = deriveRole(profile)
  const { data: blockRows } = await supabase
    .from("user_blocks")
    .select("blocker_id, blocked_id")
    .or(
      `and(blocker_id.eq.${user.id},blocked_id.eq.${profile.id}),and(blocker_id.eq.${profile.id},blocked_id.eq.${user.id})`,
    )

  const viewerBlockedUser = blockRows?.some((entry) => entry.blocker_id === user.id && entry.blocked_id === profile.id)
  const userBlockedViewer = blockRows?.some((entry) => entry.blocker_id === profile.id && entry.blocked_id === user.id)
  const { count: totalListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", profile.id)

  const { count: activeListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", profile.id)
    .eq("status", "active")

  const [{ data: ratingValues }, { data: transactions }, { data: embarkReports }, { data: recentReviews }] =
    await Promise.all([
      supabase.from("reviews").select("rating").eq("reviewed_id", profile.id),
      supabase.from("transactions").select("status").or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`),
      supabase
        .from("embark_reports")
        .select(`
        id,
        reason,
        description,
        reported_embark_id,
        status,
        created_at,
        reporter:profiles!embark_reports_reporter_id_fkey(display_name, discord_avatar, avatar_url)
      `)
        .eq("reported_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("reviews")
        .select(`
        *,
        reviewer:profiles!reviews_reviewer_id_fkey(display_name, discord_avatar, avatar_url)
      `)
        .eq("reviewed_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ])

  const successRate =
    transactions && transactions.length > 0
      ? Math.round((transactions.filter((t) => t.status === "completed").length / transactions.length) * 100)
      : 0

  const averageRating =
    ratingValues && ratingValues.length > 0
      ? ratingValues.reduce((acc, r) => acc + r.rating, 0) / ratingValues.length
      : 0

  const totalEmbarkReports = embarkReports?.length || 0

  const totalTrades = transactions?.length || 0
  const successfulTrades = transactions?.filter((t) => t.status === "completed").length || 0
  const failedTrades = transactions?.filter((t) => t.status === "cancelled" || t.status === "disputed").length || 0

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Crown className="h-3 w-3 mr-1" />
            Super Admin
          </Badge>
        )
      case "escrow":
        return (
          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
            <Shield className="h-3 w-3 mr-1" />
            Escrow Agent
          </Badge>
        )
      default:
        return (
          <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
            <User className="h-3 w-3 mr-1" />
            Raider
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Trader Profile</h1>
          <p className="text-slate-400 text-sm">View public stats and recent reviews</p>
        </div>
        <Link href="/dashboard/profile">
          <span className="text-sm text-cyan-400 hover:text-cyan-300">Back to my profile</span>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-slate-900/50 border-slate-800 lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center break-words w-full">
              <Avatar className="h-24 w-24 border-4 border-cyan-500/30">
                <AvatarImage src={(profile as any).avatar_url || profile.discord_avatar || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-indigo-600 text-white text-2xl">
                  {profile.display_name?.charAt(0)?.toUpperCase() || "R"}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-xl font-bold text-white">{profile.display_name}</h2>
              <p className="text-slate-400 text-sm">@{profile.discord_username}</p>
              {profile.embark_id && (
                <p className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full mt-2 break-all">
                  Embark ID: {profile.embark_id}
                </p>
              )}
              <div className="mt-3">{getRoleBadge(derivedRole)}</div>

              {profile.bio && <p className="mt-4 text-slate-400 text-sm">{profile.bio}</p>}

              <div className="flex items-center gap-2 mt-4 text-slate-500 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>

              {user.id !== profile.id && (
                <div className="w-full mt-5 space-y-2">
                  <SendMessageButton
                    recipientId={profile.id}
                    recipientName={profile.display_name || "User"}
                    disabled={viewerBlockedUser || userBlockedViewer}
                  />
                  <BlockUserButton
                    targetId={profile.id}
                    targetName={profile.display_name}
                    initiallyBlocked={viewerBlockedUser}
                    blockedYou={userBlockedViewer}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/10 p-3 rounded-lg">
                    <Star className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{averageRating.toFixed(1)}</p>
                    <p className="text-xs text-slate-400">Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-3 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{successRate}%</p>
                    <p className="text-xs text-slate-400">Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-cyan-500/10 p-3 rounded-lg">
                    <ArrowRightLeft className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{totalTrades}</p>
                    <p className="text-xs text-slate-400">Total Trades</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/10 p-3 rounded-lg">
                    <Package className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{activeListings || 0}</p>
                    <p className="text-xs text-slate-400">Active Listings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/10 p-3 rounded-lg">
                    <Shield className="h-5 w-5 text-purple-300" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{totalEmbarkReports}</p>
                    <p className="text-xs text-slate-400">Embark Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Trade Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <p className="text-3xl font-bold text-emerald-400">{successfulTrades}</p>
                  <p className="text-sm text-slate-400 mt-1">Successful Trades</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <p className="text-3xl font-bold text-red-400">{failedTrades}</p>
                  <p className="text-sm text-slate-400 mt-1">Failed Trades</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <p className="text-3xl font-bold text-white">{totalListings || 0}</p>
                  <p className="text-sm text-slate-400 mt-1">Total Listings Created</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {recentReviews && recentReviews.length > 0 ? (
                <div className="space-y-4">
                  {recentReviews.map((review: any) => (
                    <div key={review.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={(review.reviewer as any)?.avatar_url || review.reviewer?.discord_avatar || undefined}
                          />
                          <AvatarFallback className="bg-indigo-600 text-white">
                            {review.reviewer?.display_name?.charAt(0) || "R"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-white">{review.reviewer?.display_name}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-400 text-sm mt-1">{review.comment}</p>
                          <p className="text-slate-500 text-xs mt-2">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400">No reviews yet</p>
                  <p className="text-slate-500 text-xs mt-1">Complete trades to receive reviews</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Embark ID Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {embarkReports && embarkReports.length > 0 ? (
                <div className="space-y-4">
                  {embarkReports.map((report: any) => (
                    <div key={report.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-2">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={(report.reporter as any)?.avatar_url || report.reporter?.discord_avatar || undefined}
                          />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {report.reporter?.display_name?.charAt(0) || "R"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-white">{report.reporter?.display_name}</p>
                            <Badge
                              variant="outline"
                              className={
                                report.status === "resolved"
                                  ? "border-emerald-500/30 text-emerald-400"
                                  : report.status === "dismissed"
                                    ? "border-slate-500/30 text-slate-400"
                                    : "border-amber-500/30 text-amber-400"
                              }
                            >
                              {report.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 break-all">Embark ID: {report.reported_embark_id}</p>
                          <p className="text-sm font-medium text-red-400">{report.reason}</p>
                          {report.description && <p className="text-sm text-slate-300">{report.description}</p>}
                          <p className="text-xs text-slate-500">{new Date(report.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400">No Embark reports</p>
                  <p className="text-slate-500 text-xs mt-1">This user has no reports against them.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
