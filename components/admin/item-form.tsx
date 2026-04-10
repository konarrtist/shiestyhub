"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface ItemFormProps {
  item?: any
}

export function ItemForm({ item }: ItemFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: item?.name || "",
    category: item?.category || "",
    rarity: item?.rarity || "Common",
    icon_url: item?.icon_url || "",
  })

  const categories = [
    "Topside Material",
    "Salvaged Material",
    "Settlement Material",
    "Ingredient",
    "Consumable",
    "Blueprint",
    "Crafting Component",
    "Resource",
    "Equipment",
    "Weapon",
    "Armor",
  ]

  const rarities = ["Common", "Uncommon", "Rare", "Epic", "Legendary"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const payload = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      rarity: formData.rarity.trim(),
      icon_url: formData.icon_url.trim(),
      ...(item?.id ? { id: item.id } : {}),
    }

    if (!payload.name || !payload.category || !payload.rarity) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    const method = item ? "PUT" : "POST"
    console.log("Submitting allowed item", { method, payload })

    try {
      const response = await fetch("/api/admin/items", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const body = await response.json().catch(() => null)
      console.log("Allowed item save response", { status: response.status, ok: response.ok, body })

      if (!response.ok) {
        throw new Error(body?.error || "Failed to save item")
      }

      router.push("/admin/items")
      router.refresh()
    } catch (error) {
      console.error("Error saving item:", error)
      setError(error instanceof Error ? error.message : "Failed to save item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="text-white">
          Item Name
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="bg-slate-800 border-slate-700 text-white"
          placeholder="Advanced ARC Powercell"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category" className="text-white">
          Category
        </Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat} className="text-white">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rarity" className="text-white">
          Rarity
        </Label>
        <Select value={formData.rarity} onValueChange={(value) => setFormData({ ...formData, rarity: value })}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="Select rarity" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {rarities.map((rarity) => (
              <SelectItem key={rarity} value={rarity} className="text-white">
                {rarity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon_url" className="text-white">
          Icon URL
        </Label>
        <Input
          id="icon_url"
          type="url"
          value={formData.icon_url}
          onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
          className="bg-slate-800 border-slate-700 text-white"
          placeholder="https://example.com/icon.png"
        />
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/items")}
          className="flex-1 border-slate-700"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {item ? "Update Item" : "Create Item"}
        </Button>
      </div>
    </form>
  )
}
