"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Package, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        // No session means the reset link is invalid or expired
        setError("Invalid or expired reset link. Please request a new one.")
      }
    }
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => {
        router.push("/auth/login")
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#0a0a0b] rust-texture p-4 sm:p-6">
        <Card className="w-full max-w-md border-slate-800 bg-slate-900/70 backdrop-blur">
          <CardHeader className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="bg-green-500/20 p-4 rounded-full">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl text-white">Password Reset Successfully!</CardTitle>
            <CardDescription className="text-slate-400">
              Your password has been updated. Redirecting you to sign in...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/login">
              <Button className="w-full bg-[#00d9ff] hover:bg-[#00b8d4] text-black font-semibold">Sign In Now</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0a0a0b] rust-texture p-4 sm:p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00d9ff] blur-3xl opacity-20 rounded-full"></div>
              <div className="relative bg-gradient-to-br from-[#00d9ff] to-[#10b981] p-4 rounded-2xl arc-glow">
                <Package className="h-10 w-10 sm:h-12 sm:w-12 text-black" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Create New Password</h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base px-4">Choose a strong password for your account</p>
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900/70 backdrop-blur">
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl sm:text-2xl text-white">Reset Password</CardTitle>
            <CardDescription className="text-slate-400 text-sm">Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !!error}
                className="w-full h-12 bg-[#00d9ff] hover:bg-[#00b8d4] text-black font-semibold text-base arc-glow"
                size="lg"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
