export interface TradeItem {
  itemId: string
  itemName: string
  itemRarity: string
  itemCategory: string
  itemIconUrl: string
  quantity: number
}

// Safe pocket limit - Arc Raiders only allows 3 items in safe pocket
export const SAFE_POCKET_LIMIT = 3

export const PAYMENT_METHODS = [
  { value: "in_game_currency", label: "In-Game Currency", icon: "💎" },
  { value: "other", label: "Other (Specify)", icon: "➕" },
] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"]
