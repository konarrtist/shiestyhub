"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Info, Package } from "lucide-react"
import { ItemSelector } from "@/components/marketplace/item-selector"
import { TradeItemSelector } from "@/components/marketplace/trade-item-selector"
import type { TradeItem } from "@/lib/constants/payment-methods"

export default function CreateListingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()

  const [selectedItem, setSelectedItem] = useState<{
    itemId: string
    itemName: string
    itemRarity: string
    itemCategory: string
    itemIconUrl: string
  } | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quantity: "1",
    requestedItems: [] as TradeItem[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDebugInfo(null)

    if (!selectedItem || !selectedItem.itemId) {
      setError("Please select an item to trade")
      return
    }

    if (formData.requestedItems.length === 0) {
      setError("Please add at least one item you want in exchange")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("[v0] Auth error:", userError)
        throw new Error("Authentication error: " + userError.message)
      }

      if (!user) {
        throw new Error("You must be logged in to create a listing")
      }

      console.log("[v0] Creating listing for user:", user.id)
      console.log("[v0] Selected item:", selectedItem)
      console.log("[v0] Form data:", formData)

      const listingData = {
        seller_id: user.id,
        title: formData.title,
        description: formData.description,
        blueprint_name: selectedItem.itemName,
        blueprint_rarity: selectedItem.itemRarity,
        item_category: selectedItem.itemCategory,
        item_icon_url: selectedItem.itemIconUrl,
        quantity: Number.parseInt(formData.quantity) || 1,
        payment_methods: formData.requestedItems.map((item) => `${item.itemName} x${item.quantity}`),
        status: "active",
      }

      console.log("[v0] Listing data to insert:", listingData)

      const { data, error: insertError } = await supabase.from("listings").insert(listingData).select()

      if (insertError) {
        console.error("[v0] Insert error:", insertError)
        setDebugInfo(JSON.stringify(insertError, null, 2))
        throw new Error(insertError.message)
      }

      console.log("[v0] Listing created successfully:", data)
      router.push("/dashboard/my-listings")
    } catch (err) {
      console.error("[v0] Create listing error:", err)
      setError(err instanceof Error ? err.message : "Error creating listing")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Create Trade Listing</h1>
        <p className="text-slate-400 mt-1">List your salvaged items for barter in the Rust Belt</p>
      </div>

      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-cyan-400">Item Barter System</p>
          <p className="text-xs text-cyan-300/70">
            This is a direct item-for-item trading platform. Select what you're offering and what items you want in
            return. Raiders will initiate trades directly with you to arrange the exchange in Speranza.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-cyan-400" />
              Trade Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-cyan-500 rounded-full" />
                <h3 className="text-lg font-semibold text-white">What You're Offering</h3>
              </div>
              <ItemSelector value={selectedItem} onChange={setSelectedItem} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Trade Title
              </Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="e.g., Legendary Arc Component - Need Weapon Parts"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Trade Description
              </Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white min-h-32"
                placeholder="Describe the item condition, where you found it, and any special details about the trade..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-white">
                Quantity Available
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                placeholder="1"
              />
            </div>

            <div className="space-y-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-orange-500 rounded-full" />
                <h3 className="text-lg font-semibold text-white">What You Want in Return</h3>
              </div>
              <TradeItemSelector
                value={formData.requestedItems}
                onChange={(items) => setFormData({ ...formData, requestedItems: items })}
                description="Add the items you're willing to accept as payment for this trade"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
                {debugInfo && <pre className="mt-2 text-xs text-red-300 overflow-auto">{debugInfo}</pre>}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 border-slate-700 text-white hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish Trade Listing"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
