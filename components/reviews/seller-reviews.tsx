import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

interface SellerReviewsProps {
  sellerId: string
}

export async function SellerReviews({ sellerId }: SellerReviewsProps) {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey(
        display_name,
        discord_avatar,
        avatar_url
      )
    `)
    .eq("reviewed_id", sellerId)
    .order("created_at", { ascending: false })
    .limit(10)

  if (!reviews || reviews.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Seller Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">No reviews yet</p>
            <p className="text-sm text-slate-500 mt-1">Be the first to trade and review this seller</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Seller Reviews</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
              <span className="text-xl font-bold text-white">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-slate-400 text-sm">({reviews.length} reviews)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.map((review: any) => (
          <div key={review.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 space-y-3">
            <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={(review.reviewer as any)?.avatar_url || review.reviewer.discord_avatar || undefined}
                />
                <AvatarFallback className="bg-indigo-600 text-white text-xs">
                  {review.reviewer.display_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">{review.reviewer.display_name}</p>
                  <p className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"}`}
                  />
                ))}
              </div>
            </div>
            {review.comment && <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
