import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Star, TrendingUp, Package, ArrowRightLeft } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ListingImage } from "@/components/ui/listing-image"
import { parsePaymentMethods } from "@/lib/utils/trade-items"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search: searchQueryParam } = await searchParams
  const searchQuery = searchQueryParam?.toString().trim() ?? ""
  const supabase = await createClient()

  let listingsQuery = supabase.from("listings").select("*").eq("status", "active")

  if (searchQuery) {
    const searchPattern = `%${searchQuery}%`
    listingsQuery = listingsQuery.or(
      `title.ilike.${searchPattern},description.ilike.${searchPattern},blueprint_name.ilike.${searchPattern}`,
    )
  }

  const { data: listings, error } = await listingsQuery.order("created_at", { ascending: false })

  let listingsWithSellers: any[] = []

  if (listings && listings.length > 0) {
    const sellerIds = [...new Set(listings.map((l) => l.seller_id))]
    const allWantedNames = listings
      .flatMap((listing) => parsePaymentMethods(listing.payment_methods))
      .map((item) => item.itemName)
    const uniqueWantedNames = [...new Set(allWantedNames)]

    const { data: profiles } = await supabase
      .from("profiles")
      .select(
        "id, display_name, discord_username, username, discord_avatar, avatar_url, rating, total_trades, successful_trades",
      )
      .in("id", sellerIds)

    let allowedItems: { name: string; icon_url: string | null; rarity: string | null }[] = []

    if (uniqueWantedNames.length > 0) {
      const { data } = await supabase
        .from("allowed_items")
        .select("name, icon_url, rarity")
        .in("name", uniqueWantedNames)

      allowedItems = data || []
    }

    const allowedMap = new Map(allowedItems.map((item) => [item.name, item]))

    const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || [])

    listingsWithSellers = listings.map((listing) => ({
      ...listing,
      seller: profilesMap.get(listing.seller_id) || null,
      tradeItems: parsePaymentMethods(listing.payment_methods).map((item) => ({
        ...item,
        icon_url: allowedMap.get(item.itemName)?.icon_url,
        rarity: allowedMap.get(item.itemName)?.rarity,
      })),
    }))
  }

  const rarityColors: Record<string, string> = {
    common: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    uncommon: "bg-green-500/20 text-green-400 border-green-500/30",
    rare: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    epic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    legendary: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  }

  const getSuccessRate = (successful = 0, total = 0) => {
    if (total === 0) return 0
    return Math.round((successful / total) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Marketplace</h1>
          <p className="text-slate-400 mt-1">Browse and trade items</p>
        </div>
        <Link href="/dashboard/my-listings/create">
          <Button className="bg-cyan-600 hover:bg-cyan-700 w-full sm:w-auto">
            <Package className="h-4 w-4 mr-2" />
            List Item
          </Button>
        </Link>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="pt-6">
          <form className="relative" action="/dashboard/marketplace">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              name="search"
              defaultValue={searchQuery}
              placeholder="Search items..."
              className="pl-10 bg-slate-800 border-slate-700 text-white"
              type="search"
            />
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="py-4">
            <p className="text-red-400 text-sm">Error loading listings: {error.message}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {listingsWithSellers.map((listing: any) => {
          const tradeItems = listing.tradeItems || []
          const successRate = getSuccessRate(listing.seller?.successful_trades, listing.seller?.total_trades)

          return (
            <Card
              key={listing.id}
              className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 transition-all overflow-hidden group"
            >
              <CardHeader className="p-0">
                <div className="aspect-[16/9] bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 relative overflow-hidden">
                  <div className="h-full flex items-center justify-center p-4">
                    {/* Offering item with stack count */}
                    <div className="flex-1 flex flex-col items-center">
                      <div className="relative">
                        {listing.item_icon_url ? (
                          <ListingImage
                            src={listing.item_icon_url}
                            alt={listing.blueprint_name || "Item"}
                            width={64}
                            height={64}
                            className="object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-slate-400" />
                          </div>
                        )}
                        {listing.quantity > 1 && (
                          <div className="absolute -top-1 -right-1 bg-cyan-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center shadow-lg">
                            {listing.quantity}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-2 text-center line-clamp-1 max-w-[80px]">
                        {listing.blueprint_name || "Item"}
                      </p>
                    </div>

                    {/* Trade arrow */}
                    <div className="px-2">
                      <ArrowRightLeft className="h-5 w-5 text-cyan-500" />
                    </div>

                    <div className="flex-1 flex flex-col items-center">
                      {tradeItems.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-1 max-w-[160px]">
                          {tradeItems.map((item: any, idx: number) => (
                            <div key={idx} className="relative">
                              <div className="w-10 h-10 bg-slate-700/80 rounded-lg flex items-center justify-center border border-slate-600 overflow-hidden">
                                {item.icon_url ? (
                                  <ListingImage
                                    src={item.icon_url}
                                    alt={item.itemName}
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                  />
                                ) : (
                                  <Package className="h-5 w-5 text-amber-400" />
                                )}
                              </div>
                              {item.quantity > 1 && (
                                <div className="absolute -top-1 -right-1 bg-amber-500 text-black text-[10px] font-bold px-1 py-0.5 rounded min-w-[16px] text-center shadow-lg">
                                  {item.quantity}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-slate-700/50 rounded-lg flex items-center justify-center border border-dashed border-slate-600">
                          <span className="text-xs text-slate-500">Open</span>
                        </div>
                      )}
                      <p className="text-xs text-slate-500 mt-2">
                        {tradeItems.length > 0 ? `${tradeItems.length} wanted` : "Make offer"}
                      </p>
                    </div>
                  </div>

                  {/* Rarity badge */}
                  <div className="absolute top-2 right-2">
                    <Badge
                      className={`${rarityColors[listing.blueprint_rarity?.toLowerCase() || "common"]} border text-xs`}
                    >
                      {listing.blueprint_rarity || "Common"}
                    </Badge>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-slate-900/80 text-slate-300 border-slate-700 text-xs">
                      {listing.item_category || "Item"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-white text-sm md:text-base line-clamp-1">{listing.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{listing.description}</p>
                </div>

                {/* Seller info */}
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50">
                  <Link href={`/dashboard/profile/${listing.seller?.id || ""}`} className="shrink-0">
                    <Avatar className="h-8 w-8 border border-cyan-500/30">
                      <AvatarImage src={(listing.seller as any)?.avatar_url || listing.seller?.discord_avatar || undefined} />
                      <AvatarFallback className="bg-cyan-600 text-white text-xs">
                        {(listing.seller?.display_name || listing.seller?.username || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/profile/${listing.seller?.id || ""}`}
                      className="text-xs font-medium text-white truncate hover:text-cyan-200"
                    >
                      {listing.seller?.display_name || listing.seller?.username || "Unknown"}
                    </Link>
                    <div className="flex items-center gap-2">
                      {(listing.seller?.rating || 0) > 0 && (
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-[10px] text-yellow-400">
                            {Number(listing.seller.rating).toFixed(1)}
                          </span>
                        </div>
                      )}
                      {(listing.seller?.total_trades || 0) > 0 && (
                        <div className="flex items-center gap-0.5">
                          <TrendingUp className="h-3 w-3 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">{successRate}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Link href={`/dashboard/marketplace/${listing.id}`} className="w-full">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-sm h-9">View Trade</Button>
                </Link>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {listingsWithSellers.length === 0 && !error && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="py-12 md:py-16 text-center">
            <div className="text-5xl md:text-6xl mb-4">🛒</div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">No listings available</h3>
            <p className="text-slate-400 mb-4 text-sm">Be the first to list an item</p>
            <Link href="/dashboard/my-listings/create">
              <Button className="bg-cyan-600 hover:bg-cyan-700">Create Listing</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
