"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface EmbarkLinkFormProps {
  initialEmbarkId?: string | null
}

export function EmbarkLinkForm({ initialEmbarkId }: EmbarkLinkFormProps) {
  const [embarkId, setEmbarkId] = useState(initialEmbarkId || "")
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [error, setError] = useState<string | null>(null)
  const isLocked = Boolean(initialEmbarkId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) {
      setError("Your Embark ID is already linked. Contact support to request a change.")
      return
    }
    setStatus("saving")
    setError(null)

    try {
      const formatted = embarkId.trim()

      if (!formatted || !/^[A-Za-z0-9]+#[0-9]{3,}$/.test(formatted)) {
        throw new Error("Embark ID must follow the name#1234 format and cannot be empty")
      }

      const confirmationMessage = `Once saved, changing your Embark ID requires contacting support. Confirm you typed it exactly as it appears in-game.`

      const confirmed = window.confirm(confirmationMessage)

      if (!confirmed) {
        setStatus("idle")
        return
      }

      const response = await fetch("/api/profile/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embarkId: formatted }),
      })

      if (!response.ok) {
        const { error: responseError } = await response.json()
        throw new Error(responseError || "Failed to link Embark ID")
      }

      setStatus("success")
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Unable to save Embark ID")
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="embarkId" className="text-slate-200">
          Embark ID (required for all trades)
        </Label>
        <Input
          id="embarkId"
          value={embarkId}
          onChange={(e) => setEmbarkId(e.target.value)}
          placeholder="playername#1234"
          className="bg-slate-800 border-slate-700 text-white"
          disabled={status === "saving" || isLocked}
          required
        />
        <p className="text-xs text-slate-500">
          Use your in-game Embark username followed by <span className="font-mono text-cyan-300">#</span> and digits.
          Every transaction checks this link before proceeding.
        </p>
        <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-md px-3 py-2">
          Once saved, changing your Embark ID requires contacting support. Confirm you typed it exactly as it appears
          in-game.
        </p>
        {isLocked && (
          <p className="text-xs text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 rounded-md px-3 py-2">
            Your Embark ID is already linked. Contact support if you need to request an update.
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5" />
          <div className="text-sm text-emerald-100 space-y-1">
            <p>Your Embark ID is linked. You can now trade without prompts.</p>
            <div className="flex flex-wrap gap-2 text-xs text-emerald-200">
              <Link href="/dashboard/transactions" className="hover:text-white underline">
                View trades
              </Link>
              <span className="text-emerald-300">•</span>
              <Link href="/dashboard/marketplace" className="hover:text-white underline">
                Browse marketplace
              </Link>
            </div>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700" disabled={status === "saving" || isLocked}>
        {status === "saving" ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Linking...
          </>
        ) : (
          isLocked ? "Embark ID linked" : "Link Embark ID"
        )}
      </Button>
    </form>
  )
}
