"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export function VisitTracker({ userId }: { userId?: string }) {
  const pathname = usePathname()
  const lastTrackedPath = useRef<string | null>(null)
  const sessionId = useRef<string>("")

  useEffect(() => {
    // Generate session ID once
    if (!sessionId.current) {
      sessionId.current = Math.random().toString(36).substring(2, 15)
    }
  }, [])

  useEffect(() => {
    // Avoid tracking the same page twice
    if (lastTrackedPath.current === pathname) return
    lastTrackedPath.current = pathname

    const trackVisit = async () => {
      try {
        await fetch("/api/analytics/visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: pathname,
            userId,
            sessionId: sessionId.current,
            timestamp: new Date().toISOString(),
          }),
        })
      } catch {
        // Silent fail - don't disrupt user experience
      }
    }

    // Small delay to avoid tracking during navigation
    const timeout = setTimeout(trackVisit, 500)
    return () => clearTimeout(timeout)
  }, [pathname, userId])

  return null
}
