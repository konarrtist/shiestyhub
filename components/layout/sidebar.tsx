"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Home,
  ShoppingBag,
  MessageSquare,
  AlertCircle,
  Shield,
  ShieldCheck,
  Crown,
  User,
  Link2,
  LogOut,
  Plus,
  Receipt,
  Package,
  Users,
  Search,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { UserProfile } from "@/lib/hooks/use-user"
import { useUser } from "@/lib/hooks/use-user"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface SidebarProps {
  profile: UserProfile
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useUser()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut({ scope: "local" })
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("[v0] Logout error:", error)
      setLoggingOut(false)
    }
  }

  const baseRoutes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Marketplace",
      icon: ShoppingBag,
      href: "/dashboard/marketplace",
      active: pathname?.startsWith("/dashboard/marketplace"),
    },
    {
      label: "Find Traders",
      icon: Search,
      href: "/dashboard/find-user",
      active: pathname?.startsWith("/dashboard/find-user"),
    },
    {
      label: "My Listings",
      icon: Plus,
      href: "/dashboard/my-listings",
      active: pathname?.startsWith("/dashboard/my-listings"),
    },
    {
      label: "Transactions",
      icon: Receipt,
      href: "/dashboard/transactions",
      active: pathname?.startsWith("/dashboard/transactions"),
    },
    {
      label: "Embark Reports",
      icon: ShieldCheck,
      href: "/dashboard/reports",
      active: pathname?.startsWith("/dashboard/reports"),
    },
    {
      label: "Link Embark ID",
      icon: Link2,
      href: "/dashboard/link-username",
      active: pathname?.startsWith("/dashboard/link-username"),
    },
    {
      label: "Messages",
      icon: MessageSquare,
      href: "/dashboard/messages",
      active: pathname?.startsWith("/dashboard/messages"),
    },
    {
      label: "Profile",
      icon: User,
      href: "/dashboard/profile",
      active: pathname?.startsWith("/dashboard/profile"),
    },
  ]

  const escrowRoutes = [
    {
      label: "Disputes",
      icon: AlertCircle,
      href: "/escrow/disputes",
      active: pathname?.startsWith("/escrow/disputes"),
    },
  ]

  const adminRoutes = [
    {
      label: "Dashboard",
      icon: Crown,
      href: "/admin",
      active: pathname === "/admin",
    },
    {
      label: "Items & Blueprints",
      icon: Package,
      href: "/admin/items",
      active: pathname?.startsWith("/admin/items"),
    },
    {
      label: "Users",
      icon: Users,
      href: "/admin/users",
      active: pathname?.startsWith("/admin/users"),
    },
  ]

  const showEscrow = profile.role === "escrow" || profile.role === "super_admin"
  const showAdmin = profile.role === "super_admin"

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-900">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#00d9ff] to-[#0891b2] p-2 rounded-lg">
            <Package className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">bunkerfy.top</span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 px-3 mb-2">GENERAL</p>
            {baseRoutes.map((route) => (
              <Link key={route.href} href={route.href}>
                <Button
                  variant={route.active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    route.active
                      ? "bg-cyan-600 text-white hover:bg-cyan-700"
                      : "text-slate-400 hover:text-white hover:bg-slate-800",
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Button>
              </Link>
            ))}
          </div>

          {showEscrow && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 px-3 mb-2">ESCROW</p>
              {escrowRoutes.map((route) => (
                <Link key={route.href} href={route.href}>
                  <Button
                    variant={route.active ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      route.active
                        ? "bg-cyan-600 text-white hover:bg-cyan-700"
                        : "text-slate-400 hover:text-white hover:bg-slate-800",
                    )}
                  >
                    <route.icon className="h-4 w-4" />
                    {route.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}

          {showAdmin && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 px-3 mb-2">ADMINISTRATION</p>
              {adminRoutes.map((route) => (
                <Link key={route.href} href={route.href}>
                  <Button
                    variant={route.active ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      route.active
                        ? "bg-amber-600 text-white hover:bg-amber-700"
                        : "text-slate-400 hover:text-white hover:bg-slate-800",
                    )}
                  >
                    <route.icon className="h-4 w-4" />
                    {route.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-cyan-600 text-white">
              {(profile.username || profile.display_name || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile.display_name || profile.username || "User"}
            </p>
            <div className="flex items-center gap-1">
              {profile.role === "super_admin" && <Crown className="h-3 w-3 text-amber-400" />}
              {profile.role === "escrow" && <Shield className="h-3 w-3 text-cyan-400" />}
              {profile.role === "user" && <User className="h-3 w-3 text-slate-400" />}
              <span className="text-xs text-slate-400 capitalize">
                {profile.role === "super_admin" ? "Admin" : profile.role}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full justify-start gap-3 text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {loggingOut ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              Sign Out
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
