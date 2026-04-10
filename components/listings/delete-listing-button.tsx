"use client"

import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in")
      }

      const { error: deleteError } = await supabase.from("listings").delete().eq("id", listingId)

      if (deleteError) {
        console.error("Delete error:", deleteError)
        throw new Error(deleteError.message)
      }

      setOpen(false)

      window.location.reload()
    } catch (err) {
      console.error("Delete error:", err)
      setError(err instanceof Error ? err.message : "Failed to delete listing")
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="flex-1 border-red-500/20 text-red-400 hover:bg-red-500/10 bg-transparent text-sm h-9"
          size="sm"
        >
          <Trash2 className="mr-2 h-3 w-3" />
          Remove
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-slate-900 border-slate-800 mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Delete Listing</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            Are you sure you want to delete this listing? This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
