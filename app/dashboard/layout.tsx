export const runtime = "edge";

import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

// THESE ARE THE FIXED PATHS
import { DashboardHeader } from "@/components/layout-parts/dashboard-header"
import { Sidebar } from "@/components/layout-parts/sidebar"
import { MobileNav } from "@/components/layout-parts/mobile-nav"
import { deriveRole } from "@/lib/utils/roles"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile) {
    redirect("/auth/login")
  }

  const role = deriveRole(profile)

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-900/50">
        <Sidebar role={role} />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader profile={profile} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {children}
        </main>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <MobileNav role={role} />
        </div>
      </div>
    </div>
  )
}
