import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { MobileNav } from "@/components/layout/mobile-nav"
import { deriveRole } from "@/lib/utils/roles"

export default async function EscrowLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session?.user) {
    redirect("/auth/login")
  }

  const user = session.user

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  const profileWithRole = {
    ...profile,
    role: deriveRole({ role: profile.role, username: profile.username }),
  }

  if (profileWithRole.role !== "escrow" && profileWithRole.role !== "super_admin") {
    redirect("/dashboard")
  }

  return (
    <div className="flex h-screen bg-slate-950">
      <div className="hidden md:block">
        <Sidebar profile={profileWithRole} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader profile={profileWithRole} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">{children}</main>
        <MobileNav profile={profileWithRole} />
      </div>
    </div>
  )
}
