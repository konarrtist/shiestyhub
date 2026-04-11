import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Package, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ListingImage } from "@/components/ui/listing-image"
import { parsePaymentMethods } from "@/lib/utils/trade-items"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function MarketplacePage() {
  const supabase = await createClient()

  // Fetch all active listings from the database
  const { data: listings } = await supabase
    .from("listings")
    .select("*, profiles(username, avatar_url)")
    .order("created_at", { ascending: false })

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-950 min-h-screen text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-cyan-500">Marketplace</h2>
          <p className="text-slate-400">Trade gear and resources for Raider Dollars.</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings?.map((listing) => (
          <Card key={listing.id} className="bg-slate-900 border-slate-800 hover:border-cyan-500/50 transition-all overflow-hidden group">
            <CardHeader className="p-0">
              <ListingImage src={listing.image_url} alt={listing.title} />
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">
                  {listing.title}
                </h3>
                <Badge className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
                  {listing.category || "Item"}
                </Badge>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2 mb-4 h-10">
                {listing.description}
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <Avatar className="h-6 w-6 border border-slate-700">
                  <AvatarImage src={listing.profiles?.avatar_url} />
                  <AvatarFallback className="bg-slate-800 text-[10px]">
                    {listing.profiles?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-slate-300">
                  {listing.profiles?.username || "Unknown Trader"}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center p-4 bg-slate-900/50 border-t border-slate-800">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-slate-500 font-bold">Price</span>
                <span className="font-mono font-bold text-cyan-500">
                  {listing.price} $RD
                </span>
              </div>
              <Link href={`/dashboard/marketplace/${listing.id}`}>
                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/20">
                  Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {(!listings || listings.length === 0) && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Package className="h-12 w-12 mb-4 opacity-20" />
          <p>No listings found in the SHiESTY Hub.</p>
        </div>
      )}
    </div>
  )
}
