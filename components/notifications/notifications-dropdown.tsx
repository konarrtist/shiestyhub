"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  read: boolean
  viewed: boolean
  viewed_at: string | null
  created_at: string
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const seenNotificationIds = useRef<Set<string>>(new Set())
  const isFirstLoad = useRef(true)
  const audioContextRef = useRef<AudioContext | null>(null)

  const playNotificationSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      const ctx = audioContextRef.current || new AudioCtx()
      audioContextRef.current = ctx

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.type = "sine"
      oscillator.frequency.value = 880
      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25)

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.start()
      oscillator.stop(ctx.currentTime + 0.3)
    } catch (error) {
      console.error("[v0] Notification sound error:", error)
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error
      const incoming = (data || []).map((notification) => ({
        ...notification,
        viewed: notification.viewed ?? notification.read ?? false,
        viewed_at: notification.viewed_at ?? (notification.read ? notification.created_at : null),
      }))

      const unseen = incoming.filter(
        (notification) => !notification.viewed && !seenNotificationIds.current.has(notification.id),
      )

      if (!isFirstLoad.current && unseen.length > 0) {
        playNotificationSound()
      }

      isFirstLoad.current = false
      seenNotificationIds.current = new Set(incoming.map((n) => n.id))
      setNotifications(incoming)
    } catch (error) {
      console.error("[v0] Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }, [supabase, playNotificationSound])

  useEffect(() => {
    fetchNotifications()

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          fetchNotifications()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      audioContextRef.current?.close()
    }
  }, [fetchNotifications, supabase])

  const markAsRead = async (notificationId: string, link: string | null) => {
    try {
      const viewedAt = new Date().toISOString()
      await supabase
        .from("notifications")
        .update({ read: true, viewed: true, viewed_at: viewedAt })
        .eq("id", notificationId)

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true, viewed: true, viewed_at: viewedAt } : n)),
      )

      if (link) {
        router.push(link)
      }
    } catch (error) {
      console.error("[v0] Error marking notification as read:", error)
    }
  }

  const markAllAsViewed = async () => {
    const pendingIds = notifications
      .filter((notification) => !notification.read || !notification.viewed)
      .map((notification) => notification.id)

    if (pendingIds.length === 0) return

    const viewedAt = new Date().toISOString()

    try {
      await supabase
        .from("notifications")
        .update({ read: true, viewed: true, viewed_at: viewedAt })
        .in("id", pendingIds)

      setNotifications((prev) =>
        prev.map((notification) =>
          pendingIds.includes(notification.id)
            ? { ...notification, read: true, viewed: true, viewed_at: viewedAt }
            : notification,
        ),
      )
    } catch (error) {
      console.error("[v0] Error marking notifications as viewed:", error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu onOpenChange={(open) => open && markAllAsViewed()}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10">
          <Bell className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 bg-cyan-600 text-[10px] border-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 md:w-96 bg-slate-900 border-slate-800">
        <div className="p-3 border-b border-slate-800">
          <p className="font-semibold text-white text-sm">Notifications</p>
          {unreadCount > 0 && <p className="text-xs text-slate-400">{unreadCount} unread</p>}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-400 text-sm">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-sm">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-4 focus:bg-slate-800 cursor-pointer"
                onClick={() => markAsRead(notification.id, notification.link)}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${notification.viewed ? "text-slate-400" : "text-white"}`}>
                      {notification.title}
                    </p>
                    {!notification.viewed && <div className="h-2 w-2 rounded-full bg-cyan-500 flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-xs text-slate-500">{notification.message}</p>
                  <p className="text-xs text-slate-600">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
