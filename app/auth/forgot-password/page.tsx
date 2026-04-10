"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package, ArrowLeft, Mail } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error("Failed to send reset email")
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
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
              <div className="bg-[#00d9ff]/20 p-4 rounded-full">
                <Mail className="h-10 w-10 text-[#00d9ff]" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl text-white">Check your email</CardTitle>
            <CardDescription className="text-slate-400">
              If an account exists with <strong className="text-slate-300">{email}</strong>, you will receive a password
              reset link shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/auth/login">
              <Button className="w-full bg-[#00d9ff] hover:bg-[#00b8d4] text-black font-semibold">
                Back to Sign In
              </Button>
            </Link>
            <p className="text-center text-xs text-slate-500">
              Didn't receive the email? Check your spam folder or try again in a few minutes.
            </p>
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
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Reset Password</h1>
            <p className="text-slate-400 mt-2 text-sm sm:text-base px-4">Enter your email to receive a reset link</p>
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900/70 backdrop-blur">
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl sm:text-2xl text-white">Forgot your password?</CardTitle>
            <CardDescription className="text-slate-400 text-sm">
              No worries, we'll send you reset instructions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email address
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#00d9ff] hover:bg-[#00b8d4] text-black font-semibold text-base arc-glow"
                size="lg"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#00d9ff]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
