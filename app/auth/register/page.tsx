"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Package, CheckCircle, Shield, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters")
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

      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username.toLowerCase())
        .single()

      if (existingUser) {
        setError("Username is already taken")
        setIsLoading(false)
        return
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.toLowerCase(),
            display_name: username,
          },
        },
      })

      if (authError) throw authError

      if (data.user) {
        // Create profile with username
        await supabase.from("profiles").upsert({
          id: data.user.id,
          username: username.toLowerCase(),
          display_name: username,
          rating: 5.0,
          total_trades: 0,
          successful_trades: 0,
          failed_trades: 0,
        })

        setSuccess(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0b] rust-texture">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#10b981]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-6 right-6 w-80 h-80 bg-[#00d9ff]/5 rounded-full blur-3xl" />
        </div>
        <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md border-slate-800 bg-slate-900/70 backdrop-blur shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-[#10b981]/20 p-4 rounded-full border border-[#10b981]/30">
                  <CheckCircle className="h-10 w-10 text-[#10b981]" />
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl text-white">Account Created!</CardTitle>
              <CardDescription className="text-slate-400">
                Check your email at <strong className="text-slate-300">{email}</strong> to verify your account before
                signing in.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/auth/login">
                <Button className="w-full h-12 bg-[#00d9ff] hover:bg-[#00b8d4] text-black font-semibold arc-glow">
                  Go to Sign In
                </Button>
              </Link>
              <p className="text-center text-xs text-slate-500">Didn't receive the email? Check your spam folder.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0b] rust-texture">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#00d9ff]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-6 right-6 w-80 h-80 bg-[#22d3ee]/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00d9ff]/10 via-transparent to-transparent" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#00d9ff] blur-3xl opacity-30 rounded-full" />
                <div className="relative bg-gradient-to-br from-[#00d9ff] via-[#22d3ee] to-[#10b981] p-4 rounded-2xl arc-glow border border-slate-800">
                  <Package className="h-10 w-10 sm:h-12 sm:w-12 text-black" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Join shiesty</h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-sm mx-auto">
                Create your trader profile and start trading safely with escrow protection.
              </p>
            </div>
          </div>

          {/* Registration Card */}
          <Card className="border-slate-800 bg-slate-900/70 backdrop-blur shadow-2xl">
            <CardHeader className="space-y-3">
              <CardTitle className="text-xl sm:text-2xl text-white">Create Account</CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                Fill in your details to join the secure trading network.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-200">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="your_trader_name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
                  />
                  <p className="text-xs text-slate-500">
                    At least 3 characters. This will be visible to other traders.
                  </p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="trader@shiesty.top"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-200">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">At least 6 characters.</p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-200">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#00d9ff] hover:bg-[#00b8d4] text-black font-semibold text-base arc-glow"
                  size="lg"
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              {/* Error message */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Sign in link */}
              <div className="text-center">
                <p className="text-sm text-slate-400">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-[#00d9ff] hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>

              {/* Security info */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Shield className="h-4 w-4 text-[#10b981]" />
                  <span>Protected by escrow system & verified traders</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 px-4">
            By creating an account, you agree to follow shiesty's trading safety guidelines.
          </p>
        </div>
      </div>
    </div>
  )
}
