"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, User, Shield, Crown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface UserRoleSelectorProps {
  userId: string
  currentRole: string
}

export function UserRoleSelector({ userId, currentRole }: UserRoleSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRoleChange = async (newRole: string) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/users/role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error || "Failed to update role")
      }

      router.refresh()
    } catch (err) {
      console.error("Role change error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isLoading} className="text-slate-400 hover:text-white">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
        <DropdownMenuItem
          onClick={() => handleRoleChange("regular")}
          disabled={currentRole === "regular"}
          className="cursor-pointer focus:bg-slate-800"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Regular</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleRoleChange("escrow")}
          disabled={currentRole === "escrow"}
          className="cursor-pointer focus:bg-slate-800"
        >
          <Shield className="mr-2 h-4 w-4" />
          <span>Escrow</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleRoleChange("super_admin")}
          disabled={currentRole === "super_admin"}
          className="cursor-pointer focus:bg-slate-800"
        >
          <Crown className="mr-2 h-4 w-4" />
          <span>Super Admin</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
