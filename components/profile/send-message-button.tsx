"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Send, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface SendMessageButtonProps {
  recipientId: string
  recipientName: string
  disabled?: boolean
}

export function SendMessageButton({ recipientId, recipientName, disabled }: SendMessageButtonProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message")
      return
    }

    setLoading(true)
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error("You must be logged in")
        return
      }

      // Send the message directly to the recipient
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: recipientId,
          content: message.trim(),
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Failed to send message")
      }

      toast.success("Message sent!")
      setOpen(false)
      setMessage("")

      // Navigate to messages with this user
      router.push(`/dashboard/messages?recipient=${recipientId}`)
    } catch (error: any) {
      console.error("[v0] Send message error:", error)
      toast.error(error.message || "Failed to send message")
    } finally {
      setLoading(false)
    }
  }

  if (disabled) {
    return (
      <Button variant="outline" className="w-full border-slate-700 text-slate-500 bg-transparent" disabled>
        <MessageSquare className="h-4 w-4 mr-2" />
        Cannot message (blocked)
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
          <MessageSquare className="h-4 w-4 mr-2" />
          Send Message
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Message {recipientName}</DialogTitle>
          <DialogDescription className="text-slate-400">Start a conversation with this trader</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[120px]"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={loading || !message.trim()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
