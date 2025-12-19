"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Tag, Star, ShoppingCart, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/blogs", label: "Blogs", icon: BookOpen },
  { href: "/admin/featured", label: "Featured", icon: Star },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gradient-to-b from-white to-sky-50/30 border-r border-sky-100 min-h-screen">
      <div className="py-8 px-6 bg-gradient-to-br from-sky-100/50 to-white">
        <div className="px-2">
          <h1 className="text-4xl font-bold mb-1">
            <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 bg-clip-text text-transparent 
              filter drop-shadow-sm tracking-tight">
              Ornella
            </span>
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-8 h-[2px] bg-gradient-to-r from-indigo-600/60 to-transparent rounded-full"></div>
            <p className="text-sm text-indigo-600/80 font-medium tracking-wide uppercase">Home Décor & Art</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2 mt-12">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-sky-500/90 to-sky-600/90 text-white shadow-md"
                  : "text-slate-500 hover:bg-white hover:shadow-sm hover:text-sky-600",
                "group"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 transition-transform duration-200",
                isActive ? "text-white" : "text-slate-400 group-hover:text-sky-500",
                "group-hover:scale-110"
              )} />
              <span className={cn(
                "font-medium text-[15px]",
                isActive ? "" : "group-hover:text-sky-600"
              )}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
