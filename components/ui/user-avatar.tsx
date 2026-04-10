"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  className?: string
  isOnline?: boolean
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
  xl: "size-16",
}

export function UserAvatar({ src, alt = "User", fallback, className, isOnline = false, size = "md" }: UserAvatarProps) {
  const initials = fallback || alt?.slice(0, 2).toUpperCase() || "?"

  return (
    <div className="relative inline-block">
      {isOnline && (
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 animate-pulse",
            "blur-sm opacity-75",
            sizeClasses[size],
          )}
        />
      )}
      <Avatar className={cn(sizeClasses[size], "relative", className)}>
        <AvatarImage src={src || undefined} alt={alt} />
        <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-white">{initials}</AvatarFallback>
      </Avatar>
      {isOnline && (
        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
      )}
    </div>
  )
}
