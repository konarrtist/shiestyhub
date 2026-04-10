"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ReviewFormProps {
  transactionId: string
  reviewedId: string
  reviewedName: string
  existingReview?: { id: string; rating: number; comment: string | null } | null
}

export function ReviewForm({ transactionId, reviewedId, reviewedName, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState(existingReview?.comment || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("You must be logged in")

      const reviewPayload = {
        transaction_id: transactionId,
        reviewer_id: user.id,
        reviewed_id: reviewedId,
        rating,
        comment: comment.trim() || null,
      }

      // Insert or update review
      const { error: reviewError } = existingReview
        ? await supabase.from("reviews").update(reviewPayload).eq("id", existingReview.id)
        : await supabase.from("reviews").insert(reviewPayload)

      if (reviewError) throw reviewError

      setSuccess(existingReview ? "Review updated" : "Review saved")

      router.refresh()
    } catch (err) {
      console.error("[v0] Review submission error:", err)
      setError(err instanceof Error ? err.message : "Error submitting review")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-white">Rate {reviewedName}</Label>
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
                className={`h-8 w-8 ${
                  i < (hoveredRating || rating) ? "text-amber-400 fill-amber-400" : "text-slate-600"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment" className="text-white">
          Comment (Optional)
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this trader..."
          className="bg-slate-800 border-slate-700 text-white min-h-24"
          maxLength={160}
        />
        <p className="text-[10px] text-slate-500 text-right">{comment.length}/160</p>
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

      <Button type="submit" disabled={isLoading || rating === 0} className="w-full bg-indigo-600 hover:bg-indigo-700">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : existingReview ? (
          "Update Review"
        ) : (
          "Submit Review"
        )}
      </Button>
    </form>
  )
}

export default ReviewForm
