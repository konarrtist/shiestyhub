"use client"

import { createClient } from "@/lib/supabase/client"
import { deriveRole, type UserRole } from "@/lib/utils/roles"
import { useEffect, useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"

export interface UserProfile {
  id: string
  username: string | null
  display_name: string | null
  role: UserRole
  rating: number
  total_trades: number
  successful_trades: number
  bio: string | null
  created_at: string
  last_seen: string
  is_online: boolean
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(async () => {
    try {
      const supabase = createClient()

      // Clear state first
      setUser(null)
      setProfile(null)

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: "global" })
      if (error) console.error("[v0] Logout error:", error)

      // Force redirect
      window.location.replace("/auth/login")
    } catch (err) {
      console.error("[v0] Logout error:", err)
      window.location.replace("/auth/login")
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    async function getUser() {
      try {
        const {
          data: { user: authUser },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !authUser) {
          if (mounted) setLoading(false)
          return
        }

        if (mounted) setUser(authUser)

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single()

        if (profileError) {
          console.error("[v0] Profile error:", profileError)
        }

        if (profileData && mounted) {
          const role = deriveRole(profileData)
          setProfile({ ...profileData, role })
        }

        if (mounted) setLoading(false)
      } catch (err) {
        console.error("[v0] Unexpected error:", err)
        if (mounted) setLoading(false)
      }
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        setLoading(false)
        return
      }

      if (session?.user) {
        setUser(session.user)

        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        if (profileData && mounted) {
          const role = deriveRole(profileData)
          setProfile({ ...profileData, role })
        }
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) return

    const supabase = createClient()

    const updatePresence = async () => {
      await supabase
        .from("profiles")
        .update({
          last_seen: new Date().toISOString(),
          is_online: true,
        })
        .eq("id", user.id)
    }

    // Update immediately
    updatePresence()

    // Update every 30 seconds
    const interval = setInterval(updatePresence, 30000)

    // Mark as offline on unmount
    return () => {
      clearInterval(interval)
      supabase.from("profiles").update({ is_online: false }).eq("id", user.id)
    }
  }, [user])

  return { user, profile, loading, logout }
}
