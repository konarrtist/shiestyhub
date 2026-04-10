"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, MessageSquare } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { MessageComposer } from "@/components/messages/message-composer"
import { MessageWithSender, TransactionSummary } from "@/components/messages/types"

interface MessagesThreadProps {
  userId: string
  selectedTransaction: TransactionSummary | null
  initialMessages: MessageWithSender[]
  isParticipant: boolean
  loadError?: string | null
  blockStatus?: { blockedByYou: boolean; blockedYou: boolean }
  directUser?: { id: string; display_name?: string | null; discord_avatar?: string | null; avatar_url?: string | null } | null
}

export function MessagesThread({
  userId,
  selectedTransaction,
  initialMessages,
  isParticipant,
  loadError,
  blockStatus,
  directUser,
}: MessagesThreadProps) {
  const supabase = useMemo(() => createClient(), [])
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages || [])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const isBlocked = useMemo(() => blockStatus?.blockedByYou || blockStatus?.blockedYou || false, [blockStatus])
  const blockNotice = useMemo(() => {
    if (blockStatus?.blockedYou) return "You were blocked by this user. Messaging is disabled."
    if (blockStatus?.blockedByYou) return "You blocked this user. Unblock them to resume messaging."
    return null
  }, [blockStatus])

  const addMessageToThread = useCallback((incoming: MessageWithSender) => {
    setMessages((prev) => {
      const alreadyExists = prev.some((existing) => existing.id === incoming.id)

      if (alreadyExists) {
        return prev
      }

      return [...prev, incoming].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )
    })
  }, [])

  useEffect(() => {
    if (!selectedTransaction?.id && !directUser?.id) return

    const channel = supabase
      .channel(`messages-${selectedTransaction?.id || directUser?.id || "direct"}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: selectedTransaction?.id
            ? `transaction_id=eq.${selectedTransaction.id}`
            : `and(transaction_id.is.null,or(and(sender_id.eq.${userId},receiver_id.eq.${directUser?.id}),and(sender_id.eq.${directUser?.id},receiver_id.eq.${userId})))`,
        },
        async (payload) => {
          const newMessage = payload.new as MessageWithSender

          const { data: senderProfile } = await supabase
            .from("profiles")
            .select("id,display_name,discord_avatar")
            .eq("id", newMessage.sender_id)
            .single()

          addMessageToThread({
            ...newMessage,
            sender: senderProfile || null,
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [addMessageToThread, directUser?.id, selectedTransaction?.id, supabase, userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleMessageSent = (message: MessageWithSender) => {
    addMessageToThread(message)
  }

  if (loadError) {
    return (
      <>
        <CardHeader className="border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/messages" className="md:hidden">
              <Button variant="ghost" size="icon" className="text-slate-400">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex flex-col">
              <p className="font-medium text-white">Conversation unavailable</p>
              <p className="text-sm text-slate-400">{loadError}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <p className="font-medium text-white mb-1">We couldn't open this chat.</p>
            <p className="text-sm text-slate-400">Please select another transaction from the list.</p>
          </div>
        </CardContent>
      </>
    )
  }

  if (!selectedTransaction && !directUser) {
    return (
      <CardContent className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Select a conversation</h3>
          <p className="text-slate-400 text-sm">Choose a trade from the list to start messaging</p>
        </div>
      </CardContent>
    )
  }

  if (!isParticipant) {
    return (
      <>
        <CardHeader className="border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/messages" className="md:hidden">
              <Button variant="ghost" size="icon" className="text-slate-400">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex flex-col">
              <p className="font-medium text-white">Conversation unavailable</p>
              <p className="text-sm text-slate-400">You do not have access to this transaction</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <p className="font-medium text-white mb-1">This chat is restricted</p>
            <p className="text-sm text-slate-400">Please select a transaction you participate in.</p>
          </div>
        </CardContent>
      </>
    )
  }

  const recipientDisplay = selectedTransaction
    ? selectedTransaction.buyer_id === userId
      ? selectedTransaction.seller?.display_name
      : selectedTransaction.buyer?.display_name
    : directUser?.display_name

  const recipientAvatar = selectedTransaction
    ? selectedTransaction.buyer_id === userId
      ? (selectedTransaction.seller as any)?.avatar_url || selectedTransaction.seller?.discord_avatar || undefined
      : (selectedTransaction.buyer as any)?.avatar_url || selectedTransaction.buyer?.discord_avatar || undefined
    : directUser?.avatar_url || directUser?.discord_avatar || undefined

  const recipientId = selectedTransaction
    ? selectedTransaction.buyer_id === userId
      ? selectedTransaction.seller_id
      : selectedTransaction.buyer_id
    : directUser?.id

  return (
    <>
      <CardHeader className="border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/messages" className="md:hidden">
            <Button variant="ghost" size="icon" className="text-slate-400">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Link
            href={`/dashboard/profile/${recipientId}`}
            className="flex items-center gap-3 flex-1"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={recipientAvatar} />
              <AvatarFallback className="bg-slate-700 text-white">
                {recipientDisplay?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{recipientDisplay}</p>
              <p className="text-xs text-slate-400 truncate">
                {selectedTransaction ? selectedTransaction.listing?.title : "Direct message"}
              </p>
            </div>
          </Link>
        </div>
      </CardHeader>
      <ScrollArea className="flex-1 px-4 pt-4 pb-24 md:pb-6">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwn = message.sender_id === userId

            return (
              <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-[80%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                  <Link href={`/dashboard/profile/${message.sender?.id || ""}`} className="shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={(message.sender as any)?.avatar_url || message.sender?.discord_avatar || undefined}
                      />
                      <AvatarFallback className="bg-slate-700 text-white text-xs">
                        {message.sender?.display_name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className={`p-3 rounded-lg ${isOwn ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200"}`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? "text-cyan-100" : "text-slate-500"}`}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
          {messages.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">No messages yet</p>
              <p className="text-slate-500 text-sm mt-1">Start the conversation!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky bottom-0">
        {isParticipant && (
          <div className="space-y-2">
            {blockNotice && (
              <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 p-2 rounded">
                {blockNotice}
              </div>
            )}
            <MessageComposer
              transactionId={selectedTransaction?.id || undefined}
              receiverId={selectedTransaction ? undefined : directUser?.id}
              onMessageSent={handleMessageSent}
              disabled={isBlocked}
              disabledReason={blockNotice}
            />
          </div>
        )}
      </div>
    </>
  )
}
