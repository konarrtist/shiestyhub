import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { deriveRole } from "@/lib/utils/roles"

export default async function DisputesPage() {
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

  if (!profile || (userRole !== "escrow" && userRole !== "super_admin")) {
    redirect("/dashboard")
  }

  const { data: disputes } = await supabase
    .from("disputes")
    .select(`
      *,
      transaction:transactions(
        listing:listings(title)
      ),
      raised_by_user:profiles!disputes_raised_by_fkey(display_name, discord_avatar)
    `)
    .order("created_at", { ascending: false })

  const statusColors: Record<string, string> = {
    open: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    in_review: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    resolved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  }

  return (
    <div className="space-y-6 p-4 md:p-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Dispute Resolution</h1>
        <p className="text-slate-400 mt-1">Escrow mediation for contested trades</p>
      </div>

      <div className="grid gap-4">
        {disputes?.map((dispute: any) => (
          <Link key={dispute.id} href={`/escrow/disputes/${dispute.id}`}>
            <Card className="bg-slate-900/50 border-slate-800 hover:border-rose-500/30 transition-colors cursor-pointer">
              <CardHeader className="pb-3 p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <CardTitle className="text-white text-base md:text-lg break-words">
                        {dispute.transaction?.listing?.title || "Trade"}
                      </CardTitle>
                      <p className="text-xs md:text-sm text-slate-400 mt-1">
                        Raised by {dispute.raised_by_user?.display_name}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${statusColors[dispute.status]} border capitalize text-xs flex-shrink-0`}>
                    {dispute.status.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-slate-800/50">
                    <p className="text-xs text-slate-400 mb-1">Reason</p>
                    <p className="text-sm text-white break-words">{dispute.reason}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-slate-400">Reported</span>
                    <span className="text-white">{new Date(dispute.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {!disputes ||
        (disputes.length === 0 && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="py-12 md:py-16 text-center">
              <AlertTriangle className="h-12 w-12 md:h-16 md:w-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2">No active disputes</h3>
              <p className="text-slate-400 text-sm md:text-base">All trades are running smoothly in Speranza</p>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
