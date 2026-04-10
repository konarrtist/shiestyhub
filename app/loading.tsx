"use client"

import { Package } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-6">
      <div className="relative">
        <div className="absolute inset-0 bg-cyan-500/30 blur-3xl rounded-full" />
        <div className="relative flex items-center gap-3 px-6 py-4 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl">
          <div className="bg-gradient-to-br from-[#00d9ff] to-[#0891b2] p-3 rounded-xl">
            <Package className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Loading</p>
            <p className="text-xl font-semibold">SHiESTY.top</p>
          </div>
        </div>
        <div className="absolute -bottom-6 left-0 right-0 mx-auto flex justify-center">
          <div className="h-3 w-24 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-1/2 animate-[loading-bar_1.6s_ease-in-out_infinite] bg-cyan-500" />
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-400 text-center px-6 max-w-sm">
        Syncing the marketplace and notifications. This fan app is warming up your Arc Raiders trading hub.
      </p>
      <style jsx>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(50%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  )
}
