"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { ItemSelector } from "@/components/marketplace/item-selector"
import { TradeItemSelector } from "@/components/marketplace/trade-item-selector"
import { Loader2 } from "lucide-react"
import type { TradeItem } from "@/lib/constants/payment-methods"

interface AllowedItem {
  id: string
  name: string
  rarity: string
  category: string
  icon_url: string
}

export function EditListingForm({ listing, allowedItems }: { listing: any; allowedItems: AllowedItem[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const findAllowedItem = (name: string) => allowedItems.find((item) => item.name === name)

  const buildSelectedItem = () => {
    const matched = findAllowedItem(listing.blueprint_name)

    if (matched) {
      return {
        itemId: matched.id,
        itemName: matched.name,
        itemRarity: matched.rarity,
        itemCategory: matched.category,
        itemIconUrl: matched.icon_url,
      }
    }

    return {
      itemId: listing.blueprint_name || "",
      itemName: listing.blueprint_name || "",
      itemRarity: listing.blueprint_rarity || "",
      itemCategory: listing.item_category || "",
      itemIconUrl: listing.item_icon_url || "",
    }
  }

  const parsePaymentMethods = () => {
    const methods: any[] = listing.payment_methods || []

    return methods.map((method: any) => {
      if (typeof method === "object" && method.itemName) {
        const allowed = findAllowedItem(method.itemName)
        return {
          itemId: allowed?.id || method.itemName,
          itemName: method.itemName,
          itemRarity: allowed?.rarity || method.itemRarity || "",
          itemCategory: allowed?.category || method.itemCategory || "",
          itemIconUrl: allowed?.icon_url || method.itemIconUrl || "",
          quantity: method.quantity || 1,
        }
      }

      const match = String(method).match(/(.+?)\s*x(\d+)$/i)
      const name = match ? match[1].trim() : String(method)
      const quantity = match ? Number.parseInt(match[2], 10) || 1 : 1
      const allowed = findAllowedItem(name)

      return {
        itemId: allowed?.id || name,
        itemName: name,
        itemRarity: allowed?.rarity || "",
        itemCategory: allowed?.category || "",
        itemIconUrl: allowed?.icon_url || "",
        quantity,
      }
    })
  }

  const [selectedItem, setSelectedItem] = useState<{
    itemId: string
    itemName: string
    itemRarity: string
    itemCategory: string
    itemIconUrl: string
  } | null>(buildSelectedItem())

  const [requestedItems, setRequestedItems] = useState<TradeItem[]>(parsePaymentMethods())

  const [formData, setFormData] = useState({
    title: listing.title || "",
    description: listing.description || "",
    quantity: String(listing.quantity || 1),
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!selectedItem || !selectedItem.itemId) {
      setError("Please select the item you are offering")
      return
    }

    if (requestedItems.length === 0) {
      setError("Please add at least one item you want in exchange")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in")
      }

      const updatePayload = {
        title: formData.title,
        description: formData.description,
        blueprint_name: selectedItem.itemName,
        blueprint_rarity: selectedItem.itemRarity,
        item_category: selectedItem.itemCategory,
        item_icon_url: selectedItem.itemIconUrl,
        quantity: Number.parseInt(formData.quantity, 10) || 1,
        payment_methods: requestedItems.map((item) => ({
          itemName: item.itemName,
          quantity: item.quantity,
          itemRarity: item.itemRarity,
          itemCategory: item.itemCategory,
          itemIconUrl: item.itemIconUrl,
        })),
      }

      const { error: updateError } = await supabase
        .from("listings")
        .update(updatePayload)
        .eq("id", listing.id)
        .eq("seller_id", user.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      window.location.href = "/dashboard/my-listings"
    } catch (err) {
      console.error("Update error:", err)
      setError(err instanceof Error ? err.message : "Failed to update listing")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Listing Details</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <ItemSelector value={selectedItem} onChange={setSelectedItem} />

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-white">
              Quantity Available
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <TradeItemSelector
            value={requestedItems}
            onChange={setRequestedItems}
            label="What you want in return"
            description="Add the items you're willing to accept as payment for this trade"
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 border-slate-700 text-white hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Listing"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
