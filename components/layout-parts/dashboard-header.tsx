"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser, type UserProfile } from "@/lib/hooks/use-user"
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Camera, LogOut, Package, User2 } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
  profile?: UserProfile
}

export function DashboardHeader({ profile: serverProfile }: DashboardHeaderProps) {
  const { profile: clientProfile, logout } = useUser()
  const profile = clientProfile || serverProfile

  return (
    <header className="h-14 md:h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-[#00d9ff] to-[#0891b2] p-1.5 rounded-lg">
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="text-base md:text-lg font-bold text-white">bunkerfy.top</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          <NotificationsDropdown />

          {profile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  <Avatar className="h-8 w-8 md:h-9 md:w-9 border-2 border-cyan-500/50">
                    <AvatarImage
                      src={(profile as any).avatar_url || profile.discord_avatar || undefined}
                      alt={profile.display_name || "User"}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-indigo-600 text-white text-xs md:text-sm">
                      {(profile.display_name || profile.username || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64 bg-slate-900 border-slate-800 text-white">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-cyan-500/30">
                      <AvatarImage
                        src={(profile as any).avatar_url || profile.discord_avatar || undefined}
                        alt={profile.display_name || "User"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-indigo-600 text-white text-xs">
                        {(profile.display_name || profile.username || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold leading-none">
                        {profile.display_name || profile.username || "User"}
                      </p>
                      <p className="text-xs text-slate-400">Manage your avatar or sign out</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />

                <Link href="/dashboard/profile/edit#avatar">
                  <DropdownMenuItem className="gap-2 text-slate-200 focus:bg-slate-800">
                    <Camera className="h-4 w-4 text-cyan-300" />
                    Cambiar foto de perfil
                  </DropdownMenuItem>
                </Link>

                <Link href="/dashboard/profile">
                  <DropdownMenuItem className="gap-2 text-slate-200 focus:bg-slate-800">
                    <User2 className="h-4 w-4 text-slate-300" />
                    Ver perfil
                  </DropdownMenuItem>
                </Link>

                <DropdownMenuSeparator className="bg-slate-800" />

                <DropdownMenuItem
                  className="gap-2 text-red-200 focus:bg-red-500/10 focus:text-red-100"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="hidden md:flex text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
