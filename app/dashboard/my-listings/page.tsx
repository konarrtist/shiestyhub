import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit } from "lucide-react"
import Link from "next/link"
import { DeleteListingButton } from "@/components/listings/delete-listing-button"

export default async function MyListingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  const statusColors: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    sold: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    inactive: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  }

  const rarityColors: Record<string, string> = {
    common: "bg-slate-500/10 text-slate-300 border-slate-500/20",
    uncommon: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rare: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    epic: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    legendary: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Trade Listings</h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Manage your items available for trade</p>
        </div>
        <Link href="/dashboard/my-listings/create">
          <Button className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800">
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {listings?.map((listing: any) => (
          <Card key={listing.id} className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
            <CardHeader className="space-y-3 pb-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white text-base sm:text-lg line-clamp-2 flex-1">{listing.title}</h3>
                <Badge className={`${statusColors[listing.status]} border capitalize shrink-0 text-xs`}>
                  {listing.status}
                </Badge>
              </div>
              {listing.blueprint_rarity && (
                <Badge
                  className={`${rarityColors[listing.blueprint_rarity.toLowerCase()]} border capitalize w-fit text-xs`}
                >
                  {listing.blueprint_rarity}
                </Badge>
              )}
              <p className="text-sm text-slate-400 line-clamp-2">{listing.description}</p>
            </CardHeader>
            <CardContent className="space-y-3 pb-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                <span className="text-sm text-slate-400">Available</span>
                <span className="font-medium text-white">{listing.quantity}x</span>
              </div>
              {listing.payment_methods && listing.payment_methods.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs text-slate-500">Accepts:</span>
                  <div className="flex flex-wrap gap-1">
                    {listing.payment_methods.slice(0, 2).map((method: string) => (
                      <Badge
                        key={method}
                        variant="outline"
                        className="bg-slate-800 border-slate-700 text-slate-300 text-xs"
                      >
                        {method}
                      </Badge>
                    ))}
                    {listing.payment_methods.length > 2 && (
                      <Badge variant="outline" className="bg-slate-800 border-slate-700 text-slate-400 text-xs">
                        +{listing.payment_methods.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2 pt-3">
              <Link href={`/dashboard/my-listings/edit/${listing.id}`} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-slate-700 text-white hover:bg-slate-800 bg-transparent text-sm h-9"
                  size="sm"
                >
                  <Edit className="mr-2 h-3 w-3" />
                  Edit
                </Button>
              </Link>
              <DeleteListingButton listingId={listing.id} />
            </CardFooter>
          </Card>
        ))}
      </div>

      {!listings ||
        (listings.length === 0 && (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="py-12 sm:py-16 text-center px-4">
              <div className="text-5xl sm:text-6xl mb-4">📦</div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No trade listings yet</h3>
              <p className="text-slate-400 mb-6 text-sm sm:text-base">Start trading items from the Rust Belt</p>
              <Link href="/dashboard/my-listings/create">
                <Button className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Listing
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
