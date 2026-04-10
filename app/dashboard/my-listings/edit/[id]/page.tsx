import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { EditListingForm } from "@/components/listings/edit-listing-form"

export const dynamic = "force-dynamic"

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: listing } = await supabase.from("listings").select("*").eq("id", id).single()

  if (!listing || listing.seller_id !== user.id) redirect("/dashboard/my-listings")

  const { data: allowedItems } = await supabase.from("allowed_items").select("*").order("category").order("name")

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/my-listings">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Trade Listing</h1>
          <p className="text-slate-400 mt-1">Update your listing details</p>
        </div>
      </div>

      <EditListingForm listing={listing} allowedItems={allowedItems || []} />
    </div>
  )
}
