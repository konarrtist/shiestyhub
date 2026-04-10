"use client"

import { useState } from "react"
import { Megaphone, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const STORAGE_KEY = "bunkerfy.discordInviteSeen"

export function DiscordInviteDialog() {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false

    const hasSeenInvite = window.localStorage.getItem(STORAGE_KEY)
    if (!hasSeenInvite) {
      window.localStorage.setItem(STORAGE_KEY, "seen")
      return true
    }

    return false
  })

  const handleClose = () => {
    setOpen(false)
  }

  const handleJoinClick = () => {
    handleClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose()
        }
      }}
    >
      <DialogContent className="bg-slate-950/95 border-slate-800 text-white max-w-md" showCloseButton>
        <DialogHeader className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs text-cyan-100">
            <Megaphone className="h-4 w-4" aria-hidden="true" />
            <span>Join our Discord</span>
          </div>
          <DialogTitle className="text-2xl font-semibold">
            Join the Arc Raiders trading hub
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-base leading-relaxed">
            Connect with English-speaking Raiders to find trading partners faster, get quick help from the team, and catch marketplace updates the moment they drop.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm text-slate-300">
          <div className="flex items-start gap-2">
            <Users className="h-4 w-4 text-cyan-400 mt-0.5" aria-hidden="true" />
            <p>Meet verified Raiders, share listings safely, and get alerts about new escrow features and events.</p>
          </div>
          <div className="flex items-start gap-2">
            <Megaphone className="h-4 w-4 text-emerald-400 mt-0.5" aria-hidden="true" />
            <p>This invite shows only once to new visitors. Jump in, say hello, and start trading confidently.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button
            variant="outline"
            className="border-slate-700 text-slate-200"
            onClick={handleClose}
          >
            Maybe later
          </Button>
          <Button asChild className="bg-[#5865F2] hover:bg-[#4752c4] text-white" onClick={handleJoinClick}>
            <a href="https://discord.gg/Kg9U8ZspcF" target="_blank" rel="noreferrer noopener">
              Join Discord
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
