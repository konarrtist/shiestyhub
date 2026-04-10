import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmbarkLinkForm } from "@/components/profile/embark-link-form"
import { AlertTriangle, Link2 } from "lucide-react"

export const revalidate = 0

export default async function LinkUsernamePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("embark_id, display_name").eq("id", user.id).single()

  return (
    <div className="space-y-6 p-4 md:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-cyan-300">Trading requirement</p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Link your Embark ID</h1>
          <p className="text-slate-400 text-sm">
            Trades cannot proceed until your Embark username is linked. Your partners will rely on it to find you in-game.
          </p>
        </div>
        <Link
          href="/dashboard/profile"
          className="text-sm text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
        >
          Back to profile
        </Link>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20">
            <Link2 className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <CardTitle className="text-white">Secure every trade</CardTitle>
            <p className="text-xs text-slate-400">The platform enforces Embark linking before confirmations.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-100">
              Your Embark ID is required before confirming, messaging, or completing any trade. Use the same name players see
              in-game.
            </p>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm text-slate-200 font-semibold">Confirm before linking</p>
            <p className="text-xs text-slate-400 mt-2">
              We lock Embark IDs to keep trades consistent. If you need to change it after linking, you will have to contact
              support to request the update. Double-check your identifier before continuing.
            </p>
          </div>

          <EmbarkLinkForm initialEmbarkId={profile?.embark_id || null} />
        </CardContent>
      </Card>
    </div>
  )
}
