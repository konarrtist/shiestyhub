"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Loader2, ShieldCheck, Star } from "lucide-react"
import { useRouter } from "next/navigation"

interface EmbarkReportFormProps {
  transactionId: string
  reportedId: string
  defaultEmbarkId?: string | null
  existingReport?: {
    id: string
    rating: number | null
    comment: string | null
    reason: string
    status?: string | null
    embark_id?: string | null
  } | null
}

export function EmbarkReportForm({
  transactionId,
  reportedId,
  defaultEmbarkId,
  existingReport,
}: EmbarkReportFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(existingReport?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState(existingReport?.comment || "")
  const [reason, setReason] = useState(existingReport?.reason || "")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const embarkIdPattern = /^[A-Za-z0-9]+#[0-9]{3,}$/
  const resolvedEmbarkId = existingReport?.embark_id || defaultEmbarkId || ""
  const embarkIdIsValid = embarkIdPattern.test(resolvedEmbarkId.trim())
  const hasReason = reason.trim().length > 0
  const hasFeedback = hasReason && (rating > 0 || comment.trim().length > 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!embarkIdIsValid) {
      setError("The linked Embark ID is missing or invalid. Ask the user to relink before submitting.")
      return
    }

    if (!hasReason) {
      setError("Share a short reason for the report")
      return
    }

    if (!hasFeedback) {
      setError("Share a rating or note about their in-game behavior")
      return
    }

    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to submit a report")
      }

      const payload = {
        transaction_id: transactionId,
        reporter_id: user.id,
        reported_id: reportedId,
        embark_id: resolvedEmbarkId.trim(),
        reported_embark_id: resolvedEmbarkId.trim(),
        reason: reason.trim(),
        status: existingReport?.status || "resolved",
        rating: rating || null,
        comment: comment.trim() || null,
      }

      const { error: submitError } = existingReport
        ? await supabase.from("embark_reports").update(payload).eq("id", existingReport.id)
        : await supabase.from("embark_reports").insert(payload)

      if (submitError) {
        throw submitError
      }

      setSuccess(existingReport ? "Report updated" : "Report saved")
      router.refresh()
    } catch (err) {
      console.error("[v0] Embark report error:", err)
      setError(err instanceof Error ? err.message : "Failed to submit report")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <ShieldCheck className="h-4 w-4 text-cyan-400" />
        <span>Optional post-match report tied to their Embark ID.</span>
      </div>

      <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">Linked Embark ID</p>
        <p className="font-medium text-white break-all">
          {resolvedEmbarkId || "No Embark ID found. Ask them to link it before you can submit."}
        </p>
        <p className="text-[11px] text-slate-500">This comes from their linked account and cannot be edited here.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason" className="text-white">
          Report reason
        </Label>
        <Input
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Brief summary (e.g. griefing, trolling, excellent teamwork)"
          className="bg-slate-800 border-slate-700 text-white"
          maxLength={120}
        />
        <p className="text-[10px] text-slate-500 text-right">{reason.length}/120</p>
      </div>

      <div className="space-y-2">
        <Label className="text-white">Rate their in-game behavior</Label>
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i + 1)}
              onMouseEnter={() => setHoveredRating(i + 1)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${i < (hoveredRating || rating) ? "text-amber-400 fill-amber-400" : "text-slate-600"}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment" className="text-white">
          Notes (optional)
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Sportsmanship, teamwork, or red flags from your in-game session..."
          className="bg-slate-800 border-slate-700 text-white min-h-24"
          maxLength={200}
        />
        <p className="text-[10px] text-slate-500 text-right">{comment.length}/200</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-sm text-emerald-400">{success}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || !embarkIdIsValid || !hasFeedback}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving report...
          </>
        ) : existingReport ? (
          "Update report"
        ) : (
          "Submit report"
        )}
      </Button>
    </form>
  )
}
