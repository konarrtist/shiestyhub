"use client"

import { cn } from "@/lib/utils"
import {
  Home,
  ShoppingBag,
  Plus,
  MessageSquare,
  User,
  Crown,
  Shield,
  Receipt,
  ShieldCheck,
  Link2,
  Menu,
  AlertCircle,
  Package,
  Users,
  Search,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { UserProfile } from "@/lib/hooks/use-user"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface MobileNavProps {
  profile: UserProfile
}

export function MobileNav({ profile }: MobileNavProps) {
  const pathname = usePathname()

  const [showAllRoutes, setShowAllRoutes] = useState(false)

  const quickRoutes = [
    {
      label: "Home",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Market",
      icon: ShoppingBag,
      href: "/dashboard/marketplace",
      active: pathname?.startsWith("/dashboard/marketplace"),
    },
    {
      label: "Find",
      icon: Search,
      href: "/dashboard/find-user",
      active: pathname?.startsWith("/dashboard/find-user"),
    },
    {
      label: "Listings",
      icon: Package,
      href: "/dashboard/my-listings",
      active: pathname?.startsWith("/dashboard/my-listings"),
    },
    {
      label: "Trades",
      icon: Receipt,
      href: "/dashboard/transactions",
      active: pathname?.startsWith("/dashboard/transactions"),
    },
    {
      label: "Reports",
      icon: ShieldCheck,
      href: "/dashboard/reports",
      active: pathname?.startsWith("/dashboard/reports"),
    },
    {
      label: "Link ID",
      icon: Link2,
      href: "/dashboard/link-username",
      active: pathname?.startsWith("/dashboard/link-username"),
    },
    {
      label: "Create",
      icon: Plus,
      href: "/dashboard/my-listings/create",
      active: pathname?.startsWith("/dashboard/my-listings/create"),
      highlight: true,
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

  const roleQuickRoutes: typeof quickRoutes = []

  if (profile.role === "escrow" || profile.role === "super_admin") {
    roleQuickRoutes.push({
      label: "Escrow",
      icon: Shield,
      href: "/escrow/disputes",
      active: pathname?.startsWith("/escrow"),
    })
  }

  if (profile.role === "super_admin") {
    roleQuickRoutes.push({
      label: "Admin",
      icon: Crown,
      href: "/admin",
      active: pathname?.startsWith("/admin"),
    })
  }

  const mobileRoutes = [...quickRoutes, ...roleQuickRoutes]

  const generalRoutes = [
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
      label: "Admin Dashboard",
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
    <Dialog open={showAllRoutes} onOpenChange={setShowAllRoutes}>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 safe-area-pb">
        <div className="flex items-center justify-start h-16 px-2 gap-1 overflow-x-auto">
          {mobileRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                route.active ? "text-cyan-400" : "text-slate-400 hover:text-white",
                route.highlight && !route.active && "text-cyan-500",
              )}
            >
              {route.highlight ? (
                <div
                  className={cn(
                    "p-2 rounded-full -mt-4 shadow-lg",
                    route.active ? "bg-cyan-500 text-black" : "bg-cyan-600 text-white",
                  )}
                >
                  <route.icon className="h-5 w-5" />
                </div>
              ) : (
                <route.icon className="h-5 w-5" />
              )}
              <span className="text-[10px] font-medium">{route.label}</span>
            </Link>
          ))}

          <DialogTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px] text-slate-400 hover:text-white">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-800 text-white">
                <Menu className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-medium">Menu</span>
            </button>
          </DialogTrigger>
        </div>
      </nav>

      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Full navigation</DialogTitle>
          <p className="text-sm text-slate-400">Quick access to every section, including admin and escrow tools.</p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">General</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {generalRoutes.map((route) => (
                <Link key={route.href} href={route.href} onClick={() => setShowAllRoutes(false)}>
                  <Button
                    variant={route.active ? "secondary" : "outline"}
                    className={cn(
                      "w-full justify-start gap-3 border-slate-700",
                      route.active
                        ? "bg-cyan-600 text-white hover:bg-cyan-700"
                        : "bg-slate-800/40 text-slate-200 hover:bg-slate-800",
                    )}
                  >
                    <route.icon className="h-4 w-4" />
                    {route.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {showEscrow && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Escrow</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {escrowRoutes.map((route) => (
                  <Link key={route.href} href={route.href} onClick={() => setShowAllRoutes(false)}>
                    <Button
                      variant={route.active ? "secondary" : "outline"}
                      className={cn(
                        "w-full justify-start gap-3 border-slate-700",
                        route.active
                          ? "bg-cyan-600 text-white hover:bg-cyan-700"
                          : "bg-slate-800/40 text-slate-200 hover:bg-slate-800",
                      )}
                    >
                      <route.icon className="h-4 w-4" />
                      {route.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {showAdmin && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Administration</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {adminRoutes.map((route) => (
                  <Link key={route.href} href={route.href} onClick={() => setShowAllRoutes(false)}>
                    <Button
                      variant={route.active ? "secondary" : "outline"}
                      className={cn(
                        "w-full justify-start gap-3 border-slate-700",
                        route.active
                          ? "bg-amber-600 text-white hover:bg-amber-700"
                          : "bg-slate-800/40 text-slate-200 hover:bg-slate-800",
                      )}
                    >
                      <route.icon className="h-4 w-4" />
                      {route.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
