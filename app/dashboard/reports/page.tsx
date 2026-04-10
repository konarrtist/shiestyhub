import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"
import { ShieldCheck, Star, MessageSquare, ArrowRightLeft } from "lucide-react"

export const revalidate = 0

export default async function EmbarkReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const [
    { data: receivedReports },
    { data: submittedReports },
    { data: ratingValues },
  ] = await Promise.all([
    supabase
      .from("embark_reports")
      .select(`
        id,
        rating,
        comment,
        embark_id,
        created_at,
        reporter:profiles!embark_reports_reporter_id_fkey(display_name, avatar_url, discord_avatar),
        reported:profiles!embark_reports_reported_id_fkey(display_name, avatar_url, discord_avatar)
      `)
      .eq("reported_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("embark_reports")
      .select(`
        id,
        rating,
        comment,
        embark_id,
        created_at,
        reporter:profiles!embark_reports_reporter_id_fkey(display_name, avatar_url, discord_avatar),
        reported:profiles!embark_reports_reported_id_fkey(display_name, avatar_url, discord_avatar)
      `)
      .eq("reporter_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("embark_reports").select("rating").eq("reported_id", user.id),
  ])

  const behaviorRatings = (ratingValues || []).filter((r) => typeof r.rating === "number")
  const averageBehaviorRating =
    behaviorRatings.length > 0
      ? behaviorRatings.reduce((acc, r) => acc + (r.rating as number), 0) / behaviorRatings.length
      : null

  const summaryCards = [
    {
      label: "Average behavior",
      value: averageBehaviorRating !== null ? `${averageBehaviorRating.toFixed(1)} / 5` : "No data",
      description: "Based on Embark ID reports you have received",
      icon: Star,
    },
    {
      label: "Reports received",
      value: receivedReports?.length || 0,
      description: "Feedback tied to your Embark ID",
      icon: ShieldCheck,
    },
    {
      label: "Reports submitted",
      value: submittedReports?.length || 0,
      description: "Post-game notes you shared with others",
      icon: MessageSquare,
    },
  ]

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-2">
        <p className="text-sm text-cyan-400 font-semibold">Embark ID reputation</p>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Reports & post-match feedback</h1>
        <p className="text-slate-400 max-w-3xl text-sm">
          Track the optional Embark ID reports that keep trades safer once you finish a match together. Ratings and comments you
          receive appear on your public profile so partners know how you behave in-game.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.label} className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="bg-cyan-500/10 p-3 rounded-lg">
                  <card.icon className="h-5 w-5 text-cyan-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 text-xs uppercase tracking-wide">{card.label}</p>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  <p className="text-xs text-slate-500">{card.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReportList
          title="Reports you received"
          emptyText="No one has reported your Embark ID yet."
          reports={receivedReports}
          variant="received"
        />
        <ReportList
          title="Reports you submitted"
          emptyText="Share post-match notes to help others trade safely."
          reports={submittedReports}
          variant="submitted"
        />
      </div>
    </div>
  )
}

interface ReportListProps {
  title: string
  emptyText: string
  reports: any[] | null
  variant: "received" | "submitted"
}

function ReportList({ title, emptyText, reports, variant }: ReportListProps) {
  const renderedReports = (reports || []).map((report) => {
    const person = variant === "received" ? report.reporter : report.reported
    const displayName = person?.display_name || "Unknown user"

    return (
      <div key={report.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-2">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                variant === "received"
                  ? (report.reporter as any)?.avatar_url || report.reporter?.discord_avatar || undefined
                  : (report.reported as any)?.avatar_url || report.reported?.discord_avatar || undefined
              }
            />
            <AvatarFallback className="bg-indigo-600 text-white">{displayName.charAt(0) || "R"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-white">{displayName}</p>
              {report.rating && (
                <span className="text-xs text-amber-300 bg-amber-500/10 px-2 py-1 rounded">{report.rating.toFixed(1)} / 5</span>
              )}
            </div>
            <p className="text-xs text-slate-500">Embark ID: {report.embark_id}</p>
            {report.comment && <p className="text-sm text-slate-300">{report.comment}</p>}
            <p className="text-xs text-slate-500">{new Date(report.created_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    )
  })

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <div>
          <CardTitle className="text-white">{title}</CardTitle>
          <p className="text-xs text-slate-500 mt-1">
            Each report is tied to an Embark ID so players can verify who they met in-game.
          </p>
        </div>
        <Badge variant="outline" className="border-slate-700 text-slate-300">
          <ArrowRightLeft className="h-3 w-3 mr-1" />
          {reports?.length || 0}
        </Badge>
      </CardHeader>
      <CardContent>
        {renderedReports.length > 0 ? (
          <div className="space-y-3">{renderedReports}</div>
        ) : (
          <div className="text-center py-8">
            <ShieldCheck className="h-10 w-10 text-slate-700 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">{emptyText}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
