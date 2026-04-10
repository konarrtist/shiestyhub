"use client"

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Minus, X, AlertTriangle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { TradeItem } from "@/lib/constants/payment-methods"
import { SAFE_POCKET_LIMIT } from "@/lib/constants/payment-methods"

interface Item {
  id: string
  name: string
  rarity: string
  category: string
  icon_url: string
}

interface TradeItemSelectorProps {
  value: TradeItem[]
  onChange: (items: TradeItem[]) => void
  label?: string
  description?: string
}

export function TradeItemSelector({ value, onChange, label, description }: TradeItemSelectorProps) {
  const [items, setItems] = useState<Item[]>([])
  const [search, setSearch] = useState("")
  const [rarityFilter, setRarityFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showPicker, setShowPicker] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    console.log("[v0] TradeItemSelector: Loading items...")

    const { data, error } = await supabase.from("allowed_items").select("*").order("name")

    if (error) {
      console.error("[v0] TradeItemSelector error:", error)
      setError(error.message)
      setLoading(false)
      return
    }

    if (data) {
      console.log("[v0] TradeItemSelector: Loaded", data.length, "items")
      setItems(data)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const addItem = (item: Item) => {
    const newItem: TradeItem = {
      itemId: item.id,
      itemName: item.name,
      itemRarity: item.rarity,
      itemCategory: item.category,
      itemIconUrl: item.icon_url,
      quantity: 1,
    }
    onChange([...value, newItem])
    setShowPicker(false)
    setSearch("")
    setRarityFilter("all")
    setCategoryFilter("all")
  }

  const removeItem = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return
    const updated = [...value]
    updated[index].quantity = quantity
    onChange(updated)
  }

  const rarityColors: Record<string, string> = {
    common: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    uncommon: "bg-green-500/20 text-green-300 border-green-500/30",
    rare: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    epic: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    legendary: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  }

  const categories = useMemo(() => Array.from(new Set(items.map((item) => item.category))).sort(), [items])
  const filteredItems = useMemo(() => {
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

    return filtered
  }, [categoryFilter, items, rarityFilter, search])
  const totalItems = value.reduce((sum, item) => sum + item.quantity, 0)
  const exceedsSafePocket = totalItems > SAFE_POCKET_LIMIT

  return (
    <div className="space-y-4">
      {label && <Label className="text-white">{label}</Label>}
      {description && <p className="text-sm text-slate-400">{description}</p>}

      {value.length > 0 && (
        <div className="space-y-3">
          {value.map((item, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.itemIconUrl || "/placeholder.svg"}
                    alt={item.itemName}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "/generic-item.png"
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{item.itemName}</p>
                    <p className="text-xs text-slate-400">{item.itemCategory}</p>
                  </div>
                  <Badge className={`${rarityColors[item.itemRarity.toLowerCase()]} border capitalize shrink-0`}>
                    {item.itemRarity}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-slate-700 text-slate-400 hover:text-white bg-transparent"
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(index, Number.parseInt(e.target.value) || 1)}
                      className="w-16 h-8 text-center bg-slate-900 border-slate-700 text-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-slate-700 text-slate-400 hover:text-white bg-transparent"
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {exceedsSafePocket && (
            <Alert className="bg-amber-500/10 border-amber-500/30">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <AlertDescription className="text-amber-300">
                <p className="font-medium mb-1">Safe Pocket Limit Exceeded</p>
                <p className="text-sm text-amber-300/80">
                  You're requesting {totalItems} items but Arc Raiders only has {SAFE_POCKET_LIMIT} safe pocket slots.
                  Items beyond the safe pocket limit may be lost if the trader is killed. Proceed with caution.
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-slate-700">
            <span className="text-sm text-slate-400">Total Items Requested</span>
            <span className={`text-lg font-semibold ${exceedsSafePocket ? "text-amber-400" : "text-white"}`}>
              {totalItems} {exceedsSafePocket && `(${totalItems - SAFE_POCKET_LIMIT} at risk)`}
            </span>
          </div>
        </div>
      )}

      {!showPicker && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPicker(true)}
          className="w-full border-slate-700 text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item to Trade
        </Button>
      )}

      {showPicker && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white">Select Item to Add</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPicker(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
            </div>

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

            <ScrollArea className="h-[300px]">
              <div className="grid gap-2 pr-4">
                {loading && (
                  <div className="text-center py-8">
                    <div className="animate-spin h-6 w-6 border-4 border-[#00d9ff] border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-slate-400 mt-2 text-sm">Loading items...</p>
                  </div>
                )}
                {error && (
                  <div className="text-center py-8">
                    <p className="text-red-400 text-sm">Error: {error}</p>
                  </div>
                )}
                {!loading &&
                  !error &&
                  filteredItems.map((item) => {
                    const alreadyAdded = value.some((v) => v.itemId === item.id)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => !alreadyAdded && addItem(item)}
                        disabled={alreadyAdded}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                          alreadyAdded
                            ? "bg-slate-800/30 opacity-50 cursor-not-allowed"
                            : "bg-slate-800/50 hover:bg-slate-800"
                        }`}
                      >
                        <img
                          src={item.icon_url || "/placeholder.svg"}
                          alt={item.name}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = "/generic-item.png"
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{item.name}</p>
                          <p className="text-xs text-slate-400">{item.category}</p>
                        </div>
                        <Badge className={`${rarityColors[item.rarity.toLowerCase()]} border capitalize shrink-0`}>
                          {item.rarity}
                        </Badge>
                        {alreadyAdded && (
                          <Badge variant="secondary" className="shrink-0">
                            Added
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                {!loading && !error && filteredItems.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No items found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
