"use client"

import { useRouter } from "next/navigation"
import { Bell, Search, LogOut, User, SettingsIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/auth-store"
import { useAppStore } from "@/lib/store"
import { extractFirstNameFromEmail } from "@/lib/utils"

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { requests } = useAppStore()

  const displayName = user?.email ? extractFirstNameFromEmail(user.email) : "User"
  const avatarInitials = displayName.charAt(0).toUpperCase()

  const roleLabel = user?.role === "maintenance" ? "Maintenance" : "Employee"

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getNotifications = () => {
    if (!user) return []

    const notifications = []

    // For maintenance users, show overdue and new requests
    if (user.role === "maintenance") {
      const overdueRequests = requests.filter(
        (r) => (r.status === "new" || r.status === "in-progress") && new Date(r.dueDate) < new Date(),
      )
      const newRequests = requests.filter((r) => r.status === "new")

      if (overdueRequests.length > 0) {
        notifications.push({
          title: "Overdue requests",
          description: `${overdueRequests.length} request(s) past due date`,
          type: "warning",
        })
      }
      if (newRequests.length > 0) {
        notifications.push({
          title: "New requests",
          description: `${newRequests.length} new request(s) need attention`,
          type: "info",
        })
      }
    } else {
      // For employees, show their own request updates
      const myRequests = requests.filter((r) => r.createdBy === user.id)
      const inProgress = myRequests.filter((r) => r.status === "in-progress")
      const completed = myRequests.filter((r) => r.status === "repaired")

      if (inProgress.length > 0) {
        notifications.push({
          title: "Requests in progress",
          description: `${inProgress.length} of your request(s) being worked on`,
          type: "info",
        })
      }
      if (completed.length > 0) {
        notifications.push({
          title: "Completed requests",
          description: `${completed.length} of your request(s) have been completed`,
          type: "success",
        })
      }
    }

    return notifications
  }

  const notifications = getNotifications()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search equipment, requests..." className="w-64 pl-9 bg-secondary border-0" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground">
                  {notifications.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <DropdownMenuItem key={index} className="flex flex-col items-start gap-1 py-3">
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-sm text-muted-foreground">{notification.description}</span>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar || "/placeholder.svg?height=40&width=40&query=user avatar"} />
                <AvatarFallback>{avatarInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-muted-foreground">{roleLabel}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="flex flex-col">
              <span>{displayName}</span>
              <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onClick={() => router.push("/settings")}>
              <SettingsIcon className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
