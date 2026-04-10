export interface ProfileSummary {
  id: string
  display_name: string | null
  discord_avatar: string | null
}

export interface MessageWithSender {
  id: string
  transaction_id: string | null
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read?: boolean | null
  sender?: ProfileSummary | null
}

export interface TransactionSummary {
  id: string
  buyer_id: string
  seller_id: string
  listing?: { title?: string | null } | null
  buyer?: ProfileSummary | null
  seller?: ProfileSummary | null
}
