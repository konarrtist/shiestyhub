export const runtime = "edge";

import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { MobileNav } from "@/components/layout/mobile-nav"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { deriveRole } from "@/lib/utils/roles"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  // 1. Check if user is logged in
  if (sessionError || !session?.user) {
    redirect("/auth/login")
  }

  const user = session.user

  // 2. Fetch the user's profile from your Supabase table
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // 3. If no profile exists, boot them to login
  if (!profile) {
    redirect("/auth/login")
  }

  // 4. Set up the role-based logic (SHiESTY logic)
  const profileWithRole = {
    ...profile,
    role: deriveRole({ role: profile.role, username: profile.username }),
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <div className="hidden md:block">
        <Sidebar profile={profileWithRole} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader profile={profileWithRole} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 min-h-0">
          {children}
        </main>
        <MobileNav profile={profileWithRole} />
      </div>
    </div>
  )
}
