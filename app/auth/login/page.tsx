"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Shield, User, Crown, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (data.user) {
        router.push("/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0a0a0b] rust-texture">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#00d9ff]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-6 right-6 w-80 h-80 bg-[#22d3ee]/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00d9ff]/10 via-transparent to-transparent" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
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
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Sign in to shiesty</h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto">
                Access the secure Arc Raiders marketplace with escrow protection and verified traders.
              </p>
            </div>
          </div>

          <Card className="border-slate-800 bg-slate-900/70 backdrop-blur shadow-2xl">
            <CardHeader className="space-y-3">
              <CardTitle className="text-xl sm:text-2xl text-white">Welcome back</CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                Enter your credentials to continue trading safely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-200">
                      Password
                    </Label>
                    <Link href="/auth/forgot-password" className="text-xs text-[#00d9ff] hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#00d9ff] hover:bg-[#00b8d4] text-black font-semibold text-base arc-glow"
                  size="lg"
                >
                  {isLoading ? "Authenticating..." : "Sign In"}
                </Button>
              </form>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-slate-300">
                  New to shiesty?{" "}
                  <Link href="/auth/register" className="text-[#00d9ff] hover:underline">
                    Create an account
                  </Link>
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-400 text-center">Roles inside the hub</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="flex flex-col items-center gap-2 p-2 sm:p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300" />
                    <span className="text-xs text-white">Trader</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-2 sm:p-3 rounded-lg bg-slate-900/60 border border-[#00d9ff]/20">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-[#00d9ff]" />
                    <span className="text-xs text-white">Escrow</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-2 sm:p-3 rounded-lg bg-slate-900/60 border border-[#10b981]/20">
                    <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-[#10b981]" />
                    <span className="text-xs text-white">Admin</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-slate-400 px-4">
            Continuing means you agree to the trading safety rules of shiesty.
          </p>
        </div>
      </div>
    </div>
  )
}
