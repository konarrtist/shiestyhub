import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ListingImage } from "@/components/ui/listing-image"
import { parsePaymentMethods } from "@/lib/utils/trade-items"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function MarketplacePage() {
  const supabase = await createClient()

  // Fetch all listings for the SHiESTY Hub
  const { data: listings } = await supabase
    .from("listings")
    .select("*, profiles(username, avatar_url)")
    .order("created_at", { ascending: false })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-950 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-white">Marketplace</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {listings?.map((listing) => (
          <Card key={listing.id} className="bg-slate-900 border-slate-800 overflow-hidden">
            <CardHeader className="p-0">
              <ListingImage src={listing.image_url} alt={listing.title} />
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-white">{listing.title}</h3>
                <Badge className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
                  {listing.category || "Item"}
                </Badge>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                {listing.description}
              </p>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={listing.profiles?.avatar_url} />
                  <AvatarFallback>{listing.profiles?.username?.[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-slate-300">{listing.profiles?.username}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-slate-800 p-4 bg-slate-900/50">
              <div className="font-mono font-bold text-cyan-500">
                {listing.price} $RD
              </div>
              <Link href={`/dashboard/marketplace/${listing.id}`}>
                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500">
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
</div>
  )
}
}
