import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { redirect } from "next/navigation"
import { MessagesThread } from "@/components/messages/messages-thread"

export const revalidate = 0

export const dynamic = "force-dynamic"

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ transaction?: string; recipient?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  let transactionError: string | null = null
  let directUser: any = null
  let directMessages: any[] = []
  let directThreads: any[] = []
  let directBlockStatus: { blockedByYou: boolean; blockedYou: boolean } | undefined

  if (params.recipient && !params.transaction) {
    if (params.recipient === user.id) {
      transactionError = "You cannot start a conversation with yourself."
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id,display_name,discord_avatar,avatar_url")
        .eq("id", params.recipient)
        .single()

      directUser = profile

      const { data: blockRows } = await supabase
        .from("user_blocks")
        .select("blocker_id, blocked_id")
        .or(
          `and(blocker_id.eq.${user.id},blocked_id.eq.${params.recipient}),and(blocker_id.eq.${params.recipient},blocked_id.eq.${user.id})`,
        )

      directBlockStatus = {
        blockedByYou: blockRows?.some((entry) => entry.blocker_id === user.id && entry.blocked_id === params.recipient) || false,
        blockedYou: blockRows?.some((entry) => entry.blocker_id === params.recipient && entry.blocked_id === user.id) || false,
      }

      const { data: messageRows } = await supabase
        .from("messages")
        .select(
          `*, sender:profiles!messages_sender_id_fkey(id, display_name, discord_avatar, avatar_url)`,
        )
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${params.recipient}),and(sender_id.eq.${params.recipient},receiver_id.eq.${user.id})`,
        )
        .is("transaction_id", null)
        .order("created_at", { ascending: true })

      directMessages = messageRows || []
    }
  }

  // Get user's transactions for conversation list
  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      id,
      created_at,
      status,
      buyer_id,
      seller_id,
      listing:listings(title, blueprint_name),
      buyer:profiles!transactions_buyer_id_fkey(id, display_name, discord_avatar, avatar_url),
      seller:profiles!transactions_seller_id_fkey(id, display_name, discord_avatar, avatar_url)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("updated_at", { ascending: false })

  // Fetch latest direct-message threads for conversation list
  const { data: directMessageRows } = await supabase
    .from("messages")
    .select(`
      id,
      created_at,
      content,
      sender_id,
      receiver_id,
      sender:profiles!messages_sender_id_fkey(id, display_name, discord_avatar, avatar_url),
      receiver:profiles!messages_receiver_id_fkey(id, display_name, discord_avatar, avatar_url)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .is("transaction_id", null)
    .order("created_at", { ascending: false })

  if (directMessageRows?.length) {
    const seen = new Set<string>()

    directThreads = directMessageRows.reduce((threads: any[], message) => {
      const isSender = message.sender_id === user.id
      const counterpart = isSender ? message.receiver : message.sender

      if (!counterpart?.id || seen.has(counterpart.id)) {
        return threads
      }

      seen.add(counterpart.id)

      threads.push({
        ...message,
        counterpart,
      })

      return threads
    }, [])
  }

  // Get messages for selected transaction
  let messages: any[] = []
  let selectedTransaction: any = null
  let isParticipant = false
  let blockStatus: { blockedByYou: boolean; blockedYou: boolean } | undefined

  if (params.transaction) {
    // Prefer already-loaded transaction data to avoid a second fetch failure
    const transactionFromList = transactions?.find((tx: any) => tx.id === params.transaction)

    let txData = transactionFromList

    if (!txData) {
      const { data: fetchedTx, error } = await supabase
        .from("transactions")
        .select(`
          *,
          listing:listings(title),
          buyer:profiles!transactions_buyer_id_fkey(id, display_name, discord_avatar, avatar_url),
          seller:profiles!transactions_seller_id_fkey(id, display_name, discord_avatar, avatar_url)
        `)
        .eq("id", params.transaction)
        .single()

      txData = fetchedTx
      transactionError = error?.message || null
    }

    if (!txData && !transactionError) {
      transactionError = "Transaction not found"
    }

    selectedTransaction = txData
    isParticipant = !!txData && (txData.buyer_id === user.id || txData.seller_id === user.id)

    if (txData && isParticipant) {
      const otherUserId = txData.buyer_id === user.id ? txData.seller_id : txData.buyer_id
      const { data: blockRows } = await supabase
        .from("user_blocks")
        .select("blocker_id, blocked_id")
        .or(
          `and(blocker_id.eq.${user.id},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${user.id})`,
        )

      blockStatus = {
        blockedByYou: blockRows?.some((entry) => entry.blocker_id === user.id && entry.blocked_id === otherUserId) || false,
        blockedYou: blockRows?.some((entry) => entry.blocker_id === otherUserId && entry.blocked_id === user.id) || false,
      }

      const { data: msgData } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, display_name, discord_avatar, avatar_url)
        `)
        .eq("transaction_id", params.transaction)
        .order("created_at", { ascending: true })

      messages = msgData || []
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-4 pb-24 md:pb-0">
      {/* Conversations List */}
      <Card className="bg-slate-900/50 border-slate-800 w-full md:w-80 flex-shrink-0">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <ScrollArea className="h-[calc(100%-5rem)]">
          <div className="p-4 space-y-4">
            {directThreads.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">Direct messages</p>
                {directThreads.map((thread) => {
                  const isActive = params.recipient === thread.counterpart.id && !params.transaction

                  return (
                    <Link key={thread.counterpart.id} href={`/dashboard/messages?recipient=${thread.counterpart.id}`}>
                      <div
                        className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                          isActive
                            ? "bg-cyan-600 border-cyan-500"
                            : "bg-slate-800/50 border-slate-700 hover:border-cyan-500/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={
                                (thread.counterpart as any)?.avatar_url ||
                                thread.counterpart?.discord_avatar ||
                                undefined
                              }
                            />
                            <AvatarFallback className="bg-slate-700 text-white">
                              {thread.counterpart?.display_name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-slate-200"}`}>
                              {thread.counterpart?.display_name || "Unknown User"}
                            </p>
                            <p className={`text-xs truncate ${isActive ? "text-cyan-100" : "text-slate-400"}`}>
                              {thread.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {transactions && transactions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">Trades</p>
                {transactions.map((tx: any) => {
                  const otherUser = tx.buyer_id === user.id ? tx.seller : tx.buyer
                  const isActive = params.transaction === tx.id

                  return (
                    <Link key={tx.id} href={`/dashboard/messages?transaction=${tx.id}`}>
                      <div
                        className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                          isActive
                            ? "bg-cyan-600 border-cyan-500"
                            : "bg-slate-800/50 border-slate-700 hover:border-cyan-500/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={(otherUser as any)?.avatar_url || otherUser?.discord_avatar || undefined}
                            />
                            <AvatarFallback className="bg-slate-700 text-white">
                              {otherUser?.display_name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-slate-200"}`}>
                              {otherUser?.display_name || "Unknown User"}
                            </p>
                            <p className={`text-xs truncate ${isActive ? "text-cyan-100" : "text-slate-400"}`}>
                              {tx.listing?.title || "Trade"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {(!transactions || transactions.length === 0) && directThreads.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No conversations yet</p>
                <p className="text-slate-500 text-xs mt-1">Search for a user and send them a message to get started</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
        <Card className="bg-slate-900/50 border-slate-800 flex-1 flex flex-col">
          <MessagesThread
            key={selectedTransaction?.id || params.recipient || "no-transaction"}
            userId={user.id}
            selectedTransaction={selectedTransaction}
            initialMessages={directMessages.length ? directMessages : messages}
            isParticipant={isParticipant || !!directUser}
            loadError={transactionError}
            blockStatus={blockStatus || directBlockStatus}
            directUser={directUser}
          />
        </Card>
    </div>
  )
}
