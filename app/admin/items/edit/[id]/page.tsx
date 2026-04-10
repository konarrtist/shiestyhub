import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ItemForm } from "@/components/admin/item-form"
import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/admin"
import { deriveRole } from "@/lib/utils/roles"

// This is the specific fix for Next.js 15/16 type errors
interface EditItemPageProps {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic"

export default async function EditItemPage({ params }: EditItemPageProps) {
  // We must await the params promise directly
  const resolvedParams = await params
  const itemId = resolvedParams?.id

  if (!itemId) {
    console.error("Missing item id for admin item edit")
    notFound()
  }

  const isValidUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(itemId)

  if (!isValidUuid) {
    console.error("Invalid item id for admin item edit", { itemId })
    notFound()
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, role")
    .eq("id", user.id)
    .single()

  const userRole = deriveRole({ role: profile?.role, username: profile?.username })

  if (!profile || userRole !== "super_admin") {
    redirect("/dashboard")
  }

  const adminClient = createServiceRoleClient()

  const { data: item, error } = await adminClient
    .from("allowed_items")
    .select("*")
    .eq("id", itemId)
    .maybeSingle()

  if (error) {
    console.error("Error fetching item for edit", { id: itemId, error })
    throw error
  }

  if (!item) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Edit Item</h1>
        <p className="text-slate-400 mt-1">Update item or blueprint details</p>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemForm item={item} />
        </CardContent>
      </Card>
    </div>
  )
}
