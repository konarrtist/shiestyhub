import type { SupabaseClient } from "@supabase/supabase-js"

export interface TradeItemDisplay {
  itemName: string
  quantity: number
  icon_url?: string | null
  rarity?: string | null
}

export const parsePaymentMethods = (paymentMethods: any[]): TradeItemDisplay[] => {
  if (!paymentMethods || !Array.isArray(paymentMethods)) return []

  return paymentMethods
    .map((pm: any) => {
      if (typeof pm === "string") {
        const match = pm.match(/^(.+)\s+x(\d+)$/)
        if (match) {
          return { itemName: match[1], quantity: Number.parseInt(match[2]) }
        }
        return { itemName: pm, quantity: 1 }
      }

      if (typeof pm === "object" && pm.itemName) {
        return {
          itemName: pm.itemName,
          quantity: Number(pm.quantity) || 1,
        }
      }

      return null
    })
    .filter(Boolean) as TradeItemDisplay[]
}

export const enrichTradeItems = async (
  supabase: SupabaseClient,
  paymentMethods: any[],
): Promise<TradeItemDisplay[]> => {
  const parsed = parsePaymentMethods(paymentMethods)
  if (parsed.length === 0) return []

  const uniqueNames = [...new Set(parsed.map((item) => item.itemName))]
  const { data: allowedItems } = await supabase
    .from("allowed_items")
    .select("name, icon_url, rarity")
    .in("name", uniqueNames)

  const itemMap = new Map(
    (allowedItems || []).map((item) => [item.name, { icon_url: item.icon_url, rarity: item.rarity }]),
  )

  return parsed.map((item) => ({
    ...item,
    icon_url: itemMap.get(item.itemName)?.icon_url,
    rarity: itemMap.get(item.itemName)?.rarity,
  }))
}
