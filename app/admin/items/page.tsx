import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { deriveRole } from "@/lib/utils/roles"

export default async function AdminItemsPage() {
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

  // Get all items grouped by category
  const { data: items } = await supabase
    .from("allowed_items")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  const { count: totalItems } = await supabase.from("allowed_items").select("*", { count: "exact", head: true })

  const categories = items ? Array.from(new Set(items.map((item: any) => item.category))) : []

  const rarityColors: Record<string, string> = {
    common: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    uncommon: "bg-green-500/10 text-green-400 border-green-500/20",
    rare: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    epic: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    legendary: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Items & Blueprints</h1>
          <p className="text-slate-400 mt-1">{totalItems} items in database</p>
        </div>
        <Link href="/admin/items/create">
          <Button className="bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </Link>
      </div>

      {categories.map((category) => {
        const categoryItems = items?.filter((item: any) => item.category === category) || []

        return (
          <Card key={category} className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-cyan-400" />
                {category} ({categoryItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categoryItems.map((item: any) => (
                  <Card
                    key={item.id}
                    className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <img
                            src={item.icon_url || "/generic-item.png"}
                            alt={item.name}
                            className="w-12 h-12 object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white text-sm line-clamp-2 mb-1">{item.name}</h3>
                          <Badge
                            className={`${rarityColors[item.rarity?.toLowerCase() || "common"]} text-xs capitalize`}
                          >
                            {item.rarity || "Common"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Link href={`/admin/items/edit/${item.id}`} className="flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-slate-700 hover:bg-slate-700 bg-transparent"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-rose-500/20 hover:bg-rose-500/10 text-rose-400 bg-transparent"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
