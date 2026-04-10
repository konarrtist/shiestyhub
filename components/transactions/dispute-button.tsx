"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface DisputeButtonProps {
  transactionId: string
}

export function DisputeButton({ transactionId }: DisputeButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [evidenceUrl, setEvidenceUrl] = useState("")
  const router = useRouter()

  const handleSubmit = async () => {
    if (!reason.trim() || !description.trim()) return

    setIsLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      // Create dispute
      const { error: disputeError } = await supabase.from("disputes").insert({
        transaction_id: transactionId,
        raised_by: user.id,
        reason: reason,
        description: description,
        evidence_urls: evidenceUrl ? [evidenceUrl] : [],
        status: "open",
      })

      if (disputeError) throw disputeError

      // Update transaction status
      await supabase.from("transactions").update({ status: "disputed" }).eq("id", transactionId)

      // Log the action
      await supabase.from("transaction_logs").insert({
        transaction_id: transactionId,
        user_id: user.id,
        action: "Dispute opened",
        details: { reason, description, evidence_url: evidenceUrl || null },
      })

      setIsOpen(false)
      router.refresh()
    } catch (err) {
      console.error("Dispute error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 bg-transparent">
          <AlertCircle className="mr-2 h-4 w-4" />
          Open Dispute
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Open Dispute</DialogTitle>
          <DialogDescription className="text-slate-400">
            Describe the issue with this transaction. An escrow team member will review your case.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-white">
              Dispute reason
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Example: Item delivered did not match the listing"
              className="bg-slate-800 border-slate-700 text-white"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Detailed description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share any context that will help escrow review the trade..."
              className="bg-slate-800 border-slate-700 text-white"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="evidence" className="text-white">
              Delivery clip URL (optional)
            </Label>
            <Input
              id="evidence"
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://clips.example.com/trade-proof"
              className="bg-slate-800 border-slate-700 text-white"
            />
            <p className="text-xs text-slate-400">If you recorded the delivery, paste the link for faster review.</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-slate-700 text-white hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !reason.trim() || !description.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Open Dispute"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
