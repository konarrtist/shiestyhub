'use client'; 
export const runtime = 'edge';

import { Button } from "@/components/ui/button"
import {
  Shield,
  Package,
  Lock,
  Users,
  ArrowRight,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle2,
  Star,
  TrendingUp,
  Clock,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] rust-texture">
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00d9ff]/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#00d9ff]/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#ff6b35]/5 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <header>
          <nav className="relative border-b border-[#2a2520]/50 backdrop-blur-sm" aria-label="Main navigation">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#00d9ff] blur-md opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-[#00d9ff] to-[#0891b2] p-2 rounded-lg">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-bold text-white">SHiESTY.top</span>
                  <p className="text-xs text-slate-400 hidden sm:block">SHiESTY Raiders Trading Hub</p>
                </div>
              </div>
              <Link href="/auth/login">
                <Button className="bg-[#00d9ff] hover:bg-[#00b8d4] text-black font-semibold arc-glow text-sm sm:text-base">
                  Enter Hub
                </Button>
              </Link>
            </div>
          </nav>
        </header>

        <main>
          <section className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
            <div className="relative z-10">
              <h1 className="text-4xl sm:text-7xl font-extrabold text-white tracking-tight mb-6">
                The Ultimate <span className="text-[#00d9ff]">Raiders</span> <br /> Trading Hub
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                Secure your Bastion cells, trade your Raider Dollars, and dominate the wasteland. 
                Built exclusively for the **SHiESTY** crew.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/login">
                  <Button size="lg" className="bg-[#00d9ff] hover:bg-[#00b8d4] text-black font-bold px-8 py-6 text-lg">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Feature Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1a1a1c]/50 border border-[#2a2520] p-6 rounded-xl backdrop-blur-sm">
                <Shield className="h-8 w-8 text-[#00d9ff] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Secure Trading</h3>
                <p className="text-slate-400">Verified transactions for all your high-tier gear.</p>
              </div>
              <div className="bg-[#1a1a1c]/50 border border-[#2a2520] p-6 rounded-xl backdrop-blur-sm">
                <TrendingUp className="h-8 w-8 text-[#00d9ff] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Live Economy</h3>
                <p className="text-slate-400">Track the current value of Raider Dollars and firearms.</p>
              </div>
              <div className="bg-[#1a1a1c]/50 border border-[#2a2520] p-6 rounded-xl backdrop-blur-sm">
                <Zap className="h-8 w-8 text-[#00d9ff] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Instant Alerts</h3>
                <p className="text-slate-400">Get notified the moment a trade is finalized.</p>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-[#2a2520]/50 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
            © 2026 SHiESTY Raiders Trading Hub. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}