"use client"

import { Bell, Settings, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-sky-50 via-white to-sky-50 border-b border-sky-100 sticky top-0 z-40 w-full shadow-sm">
      <div className="container flex h-16 items-center px-6">
        <div className="flex items-center gap-6 flex-1">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
            Ornella Admin
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center text-white font-medium shadow-md">
            A
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-700">Admin User</p>
            <p className="text-xs text-slate-500">{new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric"
            })}</p>
          </div>
        </div>
      </div>
    </nav>
  )
}
