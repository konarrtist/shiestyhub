"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { MessageWithSender } from "@/components/messages/types"

interface MessageComposerProps {
  transactionId?: string
  receiverId?: string
  onMessageSent?: (message: MessageWithSender) => void
  disabled?: boolean
  disabledReason?: string | null
}

export function MessageComposer({ transactionId, receiverId, onMessageSent, disabled, disabledReason }: MessageComposerProps) {
  const [content, setContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || disabled) return

    setIsSending(true)
    setError(null)

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, receiverId, content }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || "Unable to send message")
      }

      if (result?.message) {
        onMessageSent?.(result.message as MessageWithSender)
      }

      setContent("")
    } catch (err) {
      console.error("[v0] Message send error:", err)
      setError(err instanceof Error ? err.message : "Unable to send message")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSend}>
      <div className="flex gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-slate-800 border-slate-700 text-white"
          disabled={isSending || disabled}
        />
        <Button
          type="submit"
          className="bg-cyan-600 hover:bg-cyan-700"
          disabled={isSending || !content.trim() || disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {(error || disabledReason) && <p className="text-xs text-red-400">{disabledReason || error}</p>}
    </form>
  )
}
