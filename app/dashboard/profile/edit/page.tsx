"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [embarkId, setEmbarkId] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const lastUploadRef = useRef<number | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (profileData) {
        setProfile(profileData)
        setDisplayName(profileData.display_name || "")
        setBio(profileData.bio || "")
        setEmbarkId(profileData.embark_id || "")
        setAvatarPreview((profileData as any).avatar_url || profileData.discord_avatar || null)
      }
      setLoading(false)
    }

    loadProfile()
  }, [router])

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    setError(null)

    try {
      let uploadedAvatarUrl: string | null = null

      if (avatarFile) {
        if (avatarFile.size > 2 * 1024 * 1024) {
          throw new Error("Profile picture must be under 2MB")
        }

        if (!avatarFile.type.startsWith("image/")) {
          throw new Error("Please upload a valid image file")
        }

        const now = Date.now()
        if (lastUploadRef.current && now - lastUploadRef.current < 60_000) {
          throw new Error("Please wait at least 60 seconds between avatar updates")
        }

        const formData = new FormData()
        formData.append("file", avatarFile)

        const uploadResponse = await fetch("/api/profile/avatar", { method: "POST", body: formData })

        if (!uploadResponse.ok) {
          const { error: uploadError } = await uploadResponse.json()
          throw new Error(uploadError || "Failed to upload avatar")
        }

        const { publicUrl } = await uploadResponse.json()

        uploadedAvatarUrl = publicUrl
        lastUploadRef.current = now
      }

      const targetAvatarUrl =
        uploadedAvatarUrl || (profile as any).avatar_url || profile.discord_avatar || null

      const embarkIdTrimmed = embarkId.trim()

      if (embarkIdTrimmed && !/^[A-Za-z0-9]+#[0-9]{3,}$/.test(embarkIdTrimmed)) {
        throw new Error("Embark ID must follow the name#1234 format")
      }

      const response = await fetch("/api/profile/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim() || profile.display_name || profile.discord_username || "",
          bio,
          avatarUrl: targetAvatarUrl,
          embarkId: embarkIdTrimmed,
        }),
      })

      if (!response.ok) {
        const { error: updateError } = await response.json()
        throw new Error(updateError || "Failed to save profile")
      }

      router.push("/dashboard/profile")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/profile">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Edit Profile</h1>
      </div>

      <div className="max-w-2xl">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4" id="avatar">
              <Avatar className="h-20 w-20 border-4 border-cyan-500/30">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-600 to-indigo-600 text-white text-xl">
                  {displayName?.charAt(0)?.toUpperCase() || "R"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-slate-200">Profile picture</p>
                  <p className="text-xs text-slate-500 mt-1">Upload a square image under 2MB.</p>
                  <p className="text-xs text-slate-500">Rate limited to one upload per minute.</p>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setAvatarFile(file)
                      const previewUrl = URL.createObjectURL(file)
                      setAvatarPreview(previewUrl)
                    }
                  }}
                  className="bg-slate-800 border-slate-700 text-white file:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-slate-300">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="embarkId" className="text-slate-300">
                Embark ID
              </Label>
              <Input
                id="embarkId"
                value={embarkId}
                onChange={(e) => setEmbarkId(e.target.value)}
                placeholder="playername#1234"
                className="bg-slate-800 border-slate-700 text-white"
              />
              <p className="text-xs text-slate-500">Required for trading and linking in-game. Use the name#1234 format.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-slate-300">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell other raiders about yourself..."
                className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving} className="bg-cyan-600 hover:bg-cyan-700">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Link href="/dashboard/profile">
                <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800 bg-transparent">
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
