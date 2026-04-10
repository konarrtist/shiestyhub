"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, User, Crown, Shield, Star, ArrowRightLeft, Loader2, UserX, MessageSquare } from "lucide-react"
import Link from "next/link"
import { deriveRoleClient } from "@/lib/utils/roles"

interface Profile {
  id: string
  display_name: string | null
  discord_username: string | null
  discord_avatar: string | null
  avatar_url: string | null
  embark_id: string | null
  username: string | null
  rating: number | null
  created_at: string
}

interface FindUserClientProps {
  currentUserId: string
}

export function FindUserClient({ currentUserId }: FindUserClientProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [recentUsers, setRecentUsers] = useState<Profile[]>([])

  // Load recent/featured users on mount
  useEffect(() => {
    async function loadRecentUsers() {
      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select(
          "id, display_name, discord_username, discord_avatar, avatar_url, embark_id, username, rating, created_at",
        )
        .neq("id", currentUserId)
        .order("created_at", { ascending: false })
        .limit(8)

      if (data) {
        setRecentUsers(data)
      }
    }
    loadRecentUsers()
  }, [currentUserId])

  const searchUsers = useCallback(
    async (query: string) => {
      if (query.length < 2) {
        setUsers([])
        setHasSearched(false)
        return
      }

      setIsLoading(true)
      setHasSearched(true)
      const supabase = createClient()

      const searchTerm = `%${query}%`
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, display_name, discord_username, discord_avatar, avatar_url, embark_id, username, rating, created_at",
        )
        .neq("id", currentUserId)
        .or(
          `display_name.ilike.${searchTerm},discord_username.ilike.${searchTerm},embark_id.ilike.${searchTerm},username.ilike.${searchTerm}`,
        )
        .order("rating", { ascending: false, nullsFirst: false })
        .limit(20)

      if (!error && data) {
        setUsers(data)
      }
      setIsLoading(false)
    },
    [currentUserId],
  )

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, searchUsers])

  const getRoleBadge = (profile: Profile) => {
    const role = deriveRoleClient(profile.username || "")
    switch (role) {
      case "super_admin":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
            <Crown className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )
      case "escrow":
        return (
          <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-xs">
            <Shield className="h-3 w-3 mr-1" />
            Escrow
          </Badge>
        )
      default:
        return null
    }
  }

  const UserCard = ({ profile }: { profile: Profile }) => (
    <Card className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/30 transition-all duration-200 group">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-slate-700 group-hover:border-cyan-500/50 transition-colors">
            <AvatarImage src={profile.avatar_url || profile.discord_avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-indigo-600 text-white text-lg">
              {profile.display_name?.charAt(0)?.toUpperCase() || "R"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white truncate">
                {profile.display_name || profile.discord_username || "Unknown"}
              </h3>
              {getRoleBadge(profile)}
            </div>

            {profile.discord_username && <p className="text-sm text-slate-400 truncate">@{profile.discord_username}</p>}

            {profile.embark_id && <p className="text-xs text-cyan-400/70 truncate mt-0.5">{profile.embark_id}</p>}

            <div className="flex items-center gap-3 mt-2">
              {profile.rating && profile.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs text-slate-300">{Number(profile.rating).toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link href={`/dashboard/profile/${profile.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 hover:border-cyan-500 hover:bg-cyan-500/10 text-slate-300 hover:text-cyan-400 w-full bg-transparent"
              >
                <User className="h-4 w-4 mr-1" />
                Profile
              </Button>
            </Link>
            <Link href={`/dashboard/messages?recipient=${profile.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/10 text-slate-300 hover:text-indigo-400 w-full bg-transparent"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <Input
          type="text"
          placeholder="Search by username, display name, or Embark ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20 text-lg"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400 animate-spin" />
        )}
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {isLoading ? "Searching..." : `${users.length} result${users.length !== 1 ? "s" : ""} found`}
            </h2>
          </div>

          {users.length > 0 ? (
            <div className="grid gap-3">
              {users.map((profile) => (
                <UserCard key={profile.id} profile={profile} />
              ))}
            </div>
          ) : !isLoading ? (
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="py-12 text-center">
                <UserX className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No traders found matching "{searchQuery}"</p>
                <p className="text-slate-500 text-sm mt-1">Try a different search term</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      {/* Recent Users (shown when not searching) */}
      {!hasSearched && recentUsers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-cyan-400" />
            Recent Traders
          </h2>
          <div className="grid gap-3">
            {recentUsers.map((profile) => (
              <UserCard key={profile.id} profile={profile} />
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <div className="bg-cyan-500/10 p-2 rounded-lg shrink-0">
              <Search className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Search Tips</h3>
              <ul className="text-sm text-slate-400 mt-1 space-y-1">
                <li>• Search by display name, Discord username, or Embark ID</li>
                <li>• Use at least 2 characters to start searching</li>
                <li>• Click on a profile to view their full trading history</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
