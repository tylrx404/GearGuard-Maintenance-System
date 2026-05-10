"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Database, Shield, User, Building2, Moon, Sun, LogOut, Wrench } from "lucide-react"
import { useState } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { extractFirstNameFromEmail } from "@/lib/utils"

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [darkMode, setDarkMode] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [overdueAlerts, setOverdueAlerts] = useState(true)

  const displayName = user?.email ? extractFirstNameFromEmail(user.email) : "User"
  const avatarInitials = displayName.charAt(0).toUpperCase()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <AppShell title="Settings" subtitle="Configure your GearGuard instance">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-6">
        {/* Current User */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Profile
            </CardTitle>
            <CardDescription>Your account information and role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">{avatarInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{displayName}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className={
                      user?.role === "maintenance"
                        ? "bg-accent/10 text-accent border-accent/30"
                        : "bg-chart-1/10 text-chart-1 border-chart-1/30"
                    }
                  >
                    {user?.role === "maintenance" ? (
                      <Wrench className="h-3 w-3 mr-1" />
                    ) : (
                      <User className="h-3 w-3 mr-1" />
                    )}
                    {user?.role === "maintenance" ? "Maintenance Team" : "Employee"}
                  </Badge>
                  {user?.department && (
                    <Badge variant="outline" className="bg-secondary text-muted-foreground">
                      {user.department}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" defaultValue={displayName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" defaultValue="" placeholder="Enter last name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email || ""} />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Role Permissions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Permissions
            </CardTitle>
            <CardDescription>Your access level in GearGuard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user?.role === "maintenance" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-sm font-medium text-success">Full Access</p>
                      <p className="text-xs text-muted-foreground mt-1">View all requests</p>
                    </div>
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-sm font-medium text-success">Full Access</p>
                      <p className="text-xs text-muted-foreground mt-1">Update request status</p>
                    </div>
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-sm font-medium text-success">Full Access</p>
                      <p className="text-xs text-muted-foreground mt-1">Manage equipment</p>
                    </div>
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-sm font-medium text-success">Full Access</p>
                      <p className="text-xs text-muted-foreground mt-1">Manage teams</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-sm font-medium text-success">Allowed</p>
                      <p className="text-xs text-muted-foreground mt-1">Create requests</p>
                    </div>
                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-sm font-medium text-success">Allowed</p>
                      <p className="text-xs text-muted-foreground mt-1">View own requests</p>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <p className="text-sm font-medium text-destructive">Restricted</p>
                      <p className="text-xs text-muted-foreground mt-1">Update status</p>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <p className="text-sm font-medium text-destructive">Restricted</p>
                      <p className="text-xs text-muted-foreground mt-1">Manage teams</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization
            </CardTitle>
            <CardDescription>Company settings and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input id="orgName" defaultValue="Acme Manufacturing Co." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="America/New_York" />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Overdue Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified about overdue requests</p>
              </div>
              <Switch checked={overdueAlerts} onCheckedChange={setOverdueAlerts} />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </CardContent>
        </Card>

        {/* Database */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
            <CardDescription>Connection status and information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                <span className="font-medium">MongoDB</span>
              </div>
              <Badge variant="outline" className="bg-success/5 text-success border-success/20">
                Connected
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Database: gearguard_production</p>
              <p>Collections: users, equipment, teams, requests</p>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              Two-Factor Authentication
            </Button>
            <Separator />
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </AppShell>
  )
}
