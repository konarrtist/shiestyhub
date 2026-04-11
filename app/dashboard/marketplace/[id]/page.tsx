import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ArrowLeft, ShieldCheck, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { parsePaymentMethods } from "@/lib/utils/trade-items"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the specific listing
  const { data: listing, error } = await supabase
    .from("listings")
    .select(`
      *,
      profiles(username, avatar_url, rating)
    `)
    .eq("id", id)
    .single()

  if (error || !listing) {
    notFound()
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-slate-950 min-h-screen text-white">
      <Link href="/dashboard/marketplace" className="flex items-center text-slate-500 hover:text-cyan-500 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Side: Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">{listing.title}</h1>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20 px-3 py-1">
                {listing.category}
              </Badge>
              <div className="flex items-center text-slate-400 text-sm">
                <Clock className="w-4 h-4 mr-1" />
                {new Date(listing.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <h3 className="text-xl font-semibold border-b border-slate-800 pb-2">Description</h3>
            <p className="text-slate-300 mt-4 leading-relaxed">
              {listing.description}
            </p>
          </div>
        </div>

        {/* Right Side: Action Card */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
            <div className="mb-6">
              <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Price</span>
              <p className="text-4xl font-mono font-bold text-cyan-500">{listing.price} $RD</p>
            </div>

            <div className="space-y-4">
              <Button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-12 shadow-lg shadow-cyan-900/20">
                Contact Seller
              </Button>
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                <ShieldCheck className="w-3 h-3 text-cyan-500" /> Secure Hub Trade
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-slate-800">
                  <AvatarImage src={listing.profiles?.avatar_url} />
                  <AvatarFallback className="bg-slate-800 text-cyan-500">
                    {listing.profiles?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-white">{listing.profiles?.username}</p>
                  <p className="text-xs text-slate-500">Trusted Raider</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
