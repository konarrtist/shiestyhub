import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { parsePaymentMethods } from "@/lib/utils/trade-items"
import { InitiateTradeButton } from "@/components/initiate-trade-button"

export const dynamic = "force-dynamic"

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: listing, error } = await supabase
    .from("listings")
    .select(`*, profiles(username, avatar_url, rating)`)
    .eq("id", id)
    .single()

  if (error || !listing) notFound()

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-slate-950 min-h-screen text-white">
      <Link href="/dashboard/marketplace" className="flex items-center text-slate-500 hover:text-cyan-500 mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
          <p className="text-slate-300 mb-6">{listing.description}</p>
        </div>
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 h-fit">
          <p className="text-3xl font-bold text-cyan-500 mb-6">{listing.price} $RD</p>
          <InitiateTradeButton itemId={listing.id} ownerId={listing.seller_id} itemName={listing.title} />
        </div>
      </div>
    </main>
  )
}
