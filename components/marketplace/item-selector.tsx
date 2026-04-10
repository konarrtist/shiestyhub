"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Item {
  id: string
  name: string
  rarity: string
  category: string
  icon_url: string
}

interface ItemSelectorProps {
  value: { itemId: string; itemName: string; itemRarity: string; itemCategory: string; itemIconUrl: string } | null
  onChange: (item: {
    itemId: string
    itemName: string
    itemRarity: string
    itemCategory: string
    itemIconUrl: string
  }) => void
}

export function ItemSelector({ value, onChange }: ItemSelectorProps) {
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [search, setSearch] = useState("")
  const [rarityFilter, setRarityFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMounted = useRef(true)

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      console.log("[v0] ItemSelector: Loading items from database...")

      const { data, error } = await supabase
        .from("allowed_items")
        .select("id, name, rarity, category, icon_url")
        .order("name")

      if (!isMounted.current) return

      if (error) {
        console.error("[v0] ItemSelector error:", error)
        setError(error.message)
        return
      }

      if (!data || data.length === 0) {
        console.warn("[v0] ItemSelector: No data returned")
        setError("No items found in database")
        setItems([])
        setFilteredItems([])
        return
      }

      console.log("[v0] ItemSelector: Loaded", data.length, "items")
      setItems(data)
      setFilteredItems(data)
    } catch (err: any) {
      if (!isMounted.current) return
      console.error("[v0] ItemSelector load error:", err)
      setError(err?.message || "Failed to load items")
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [])

  const filterItems = useCallback(() => {
    let filtered = items

    if (search) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.category.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (rarityFilter !== "all") {
      filtered = filtered.filter((item) => item.rarity.toLowerCase() === rarityFilter.toLowerCase())
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter)
    }

    setFilteredItems(filtered)
  }, [categoryFilter, items, rarityFilter, search])

  useEffect(() => {
    loadItems()

    return () => {
      isMounted.current = false
    }
  }, [loadItems])

  useEffect(() => {
    filterItems()
  }, [filterItems])

  const rarityColors: Record<string, string> = {
    common: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    uncommon: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    rare: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    epic: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    legendary: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  }

  const categories = useMemo(() => Array.from(new Set(items.map((item) => item.category))).sort(), [items])

  return (
    <div className="space-y-4">
      <Label className="text-white">Select Item</Label>

      {value && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <img
                src={value.itemIconUrl || "/placeholder.svg"}
                alt={value.itemName}
                className="w-12 h-12 object-contain"
              />
              <div className="flex-1">
                <p className="font-medium text-white">{value.itemName}</p>
                <p className="text-xs text-slate-400">{value.itemCategory}</p>
              </div>
              <Badge className={`${rarityColors[value.itemRarity.toLowerCase()]} border capitalize`}>
                {value.itemRarity}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange({ itemId: "", itemName: "", itemRarity: "", itemCategory: "", itemIconUrl: "" })
                }
                className="text-slate-400 hover:text-white"
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!value && (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <Select value={rarityFilter} onValueChange={setRarityFilter}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Filter by rarity" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="uncommon">Uncommon</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
                <SelectItem value="legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-slate-900/50 border-slate-800">
            <ScrollArea className="h-[400px]">
              <div className="p-4 grid gap-2">
                {loading && (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-[#00d9ff] border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-slate-400 mt-4">Loading items...</p>
                    <p className="text-xs text-slate-500 mt-2">This may take a few seconds</p>
                  </div>
                )}
                {error && (
                  <div className="text-center py-8">
                    <p className="text-red-400">Error: {error}</p>
                    <Button onClick={loadItems} className="mt-4 bg-transparent" variant="outline">
                      Retry
                    </Button>
                  </div>
                )}
                {!loading &&
                  !error &&
                  filteredItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        onChange({
                          itemId: item.id,
                          itemName: item.name,
                          itemRarity: item.rarity,
                          itemCategory: item.category,
                          itemIconUrl: item.icon_url,
                        })
                      }
                      className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-left"
                    >
                      <img
                        src={item.icon_url || "/placeholder.svg"}
                        alt={item.name}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=40&width=40"
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.category}</p>
                      </div>
                      <Badge className={`${rarityColors[item.rarity.toLowerCase()]} border capitalize shrink-0`}>
                        {item.rarity}
                      </Badge>
                    </button>
                  ))}
                {!loading && !error && filteredItems.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No items found</p>
                    <p className="text-xs text-slate-500 mt-2">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </>
      )}
    </div>
  )
}
