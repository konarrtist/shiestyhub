"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, ShieldAlert } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface BlockUserButtonProps {
  targetId: string
  targetName?: string | null
  initiallyBlocked?: boolean
  blockedYou?: boolean
}

export function BlockUserButton({ targetId, targetName, initiallyBlocked, blockedYou }: BlockUserButtonProps) {
  const [isBlocked, setIsBlocked] = useState(initiallyBlocked || false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const toggleBlock = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You need to be logged in to manage blocks")
      }

      if (isBlocked) {
        const { error: unblockError } = await supabase
          .from("user_blocks")
          .delete()
          .eq("blocker_id", user.id)
          .eq("blocked_id", targetId)

        if (unblockError) throw unblockError
        setIsBlocked(false)
      } else {
        const { error: blockError } = await supabase.from("user_blocks").upsert({
          blocker_id: user.id,
          blocked_id: targetId,
        })

        if (blockError) throw blockError
        setIsBlocked(true)
      }
    } catch (err) {
      console.error("[v0] block toggle error", err)
      setError(err instanceof Error ? err.message : "Unable to update block status")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <ShieldAlert className="h-4 w-4 text-amber-400" />
        <span>
          Blocked users cannot message or continue trades with you. {blockedYou ? "This user has already blocked you." : ""}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          variant={isBlocked ? "secondary" : "destructive"}
          className={isBlocked ? "bg-slate-800 border-slate-600" : ""}
          onClick={toggleBlock}
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : isBlocked ? "Unblock user" : `Block ${targetName || "user"}`}
        </Button>
        {error && (
          <div className="flex items-start gap-2 p-2 rounded bg-red-500/10 border border-red-500/20 text-xs text-red-200">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}
