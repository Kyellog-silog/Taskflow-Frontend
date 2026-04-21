"use client"

import { Link, useLocation } from "react-router-dom"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import { LayoutDashboard, Kanban, Users, User, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Logo } from "./Logo"
import * as React from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Boards",    href: "/boards",    icon: Kanban },
  { name: "Teams",     href: "/teams",     icon: Users },
  { name: "Profile",   href: "/profile",   icon: User },
  { name: "Settings",  href: "/settings",  icon: Settings },
]

export function Sidebar() {
  const location = useLocation()
  const { logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(href + "/")

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-[#080d1f] border-r border-white/[0.06] transition-all duration-300",
        collapsed ? "w-14" : "w-60",
      )}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/[0.06]">
        {!collapsed && (
          <Link to="/dashboard" aria-label="Dashboard">
            <Logo size={26} showText />
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((c) => !c)}
          className={cn("p-1.5 text-slate-500 hover:text-white hover:bg-white/5 transition-colors", collapsed && "mx-auto")}
        >
          {collapsed
            ? <ChevronRight className="h-4 w-4" aria-hidden="true" />
            : <ChevronLeft  className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5" aria-label="Sidebar navigation">
        {navigation.map(({ name, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={name}
              to={href}
              title={collapsed ? name : undefined}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                active
                  ? "bg-violet-600/20 text-violet-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
                collapsed && "justify-center",
              )}
            >
              <Icon className="h-4.5 w-4.5 flex-shrink-0" aria-hidden="true" />
              {!collapsed && <span>{name}</span>}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" aria-hidden="true" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-2 py-3 border-t border-white/[0.06]">
        <Button
          variant="ghost"
          onClick={logout}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "w-full text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium",
            collapsed ? "justify-center px-0" : "justify-start gap-3 px-2.5",
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {!collapsed && <span>Sign out</span>}
        </Button>
      </div>
    </div>
  )
}
