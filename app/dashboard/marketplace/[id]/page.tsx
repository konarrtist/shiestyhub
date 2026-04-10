import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Star, TrendingUp, Package, ArrowRightLeft } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ListingImage } from "@/components/ui/listing-image"
import { parsePaymentMethods } from "@/lib/trade-items"
import { InitiateTradeButton } from "@/components/initiate-trade-button"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const { search } = await searchParams
  const supabase = await createClient()

  // Fetch listings from Supabase
  const { data: listings } = await supabase
    .from("listings")
    .select("*, profiles(username, avatar_url)")
    .order("created_at", { ascending: false })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Marketplace</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {listings?.map((listing) => (
          <Card key={listing.id}>
            <CardHeader>
              <ListingImage src={listing.image_url} alt={listing.title} />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{listing.title}</h3>
                <Badge variant="secondary">{listing.category}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {listing.description}
              </p>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={listing.profiles?.avatar_url} />
                  <AvatarFallback>{listing.profiles?.username?.[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{listing.profiles?.username}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="font-mono font-bold text-primary">
                {listing.price} $RD
              </div>
              <Link href={`/dashboard/marketplace/${listing.id}`}>
                <Button size="sm">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
