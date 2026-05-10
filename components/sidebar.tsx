"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Wrench,
  Users,
  ClipboardList,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Lock,
  UserCog,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuthStore, canUserPerformAction } from "@/lib/auth-store"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, permission: null },
  { href: "/equipment", label: "Equipment", icon: Wrench, permission: null },
  { href: "/teams", label: "Teams", icon: Users, permission: "manage_teams" as const },
  { href: "/users", label: "Users", icon: UserCog, permission: "manage_teams" as const },
  { href: "/requests", label: "Requests", icon: ClipboardList, permission: null },
  { href: "/calendar", label: "Calendar", icon: Calendar, permission: null },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuthStore()

  // Filter nav items based on user permissions
  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true
    return canUserPerformAction(user, item.permission)
  })

  return (
    <TooltipProvider>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col"
      >
        <div className={cn("flex items-center h-16 px-4", collapsed ? "justify-center" : "justify-between")}>
          <Logo size={collapsed ? "sm" : "md"} showText={!collapsed} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "absolute -right-4 bg-sidebar border border-sidebar-border rounded-full",
            )}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
                      "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                      isActive && "bg-sidebar-accent text-sidebar-primary font-medium",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    <item.icon size={20} className={cn(isActive && "text-sidebar-primary")} />
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm"
                      >
                        {item.label}
                      </motion.span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 w-1 h-6 bg-sidebar-primary rounded-r-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>
            )
          })}

          {/* Show locked items for employees */}
          {user?.role === "employee" && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-50 cursor-not-allowed",
                    "text-sidebar-foreground/40",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <div className="relative">
                    <Users size={20} />
                    <Lock size={10} className="absolute -bottom-1 -right-1" />
                  </div>
                  {!collapsed && <span className="text-sm">Teams</span>}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="flex items-center gap-2">
                  <Lock size={12} />
                  Maintenance access only
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  pathname === "/settings" && "bg-sidebar-accent text-sidebar-primary",
                  collapsed && "justify-center px-2",
                )}
              >
                <Settings size={20} />
                {!collapsed && <span className="text-sm">Settings</span>}
              </Link>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Settings</TooltipContent>}
          </Tooltip>
        </div>
      </motion.aside>
    </TooltipProvider>
  )
}
