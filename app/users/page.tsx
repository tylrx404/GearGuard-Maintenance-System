"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, Plus, MoreHorizontal, User, Wrench, Shield, Mail, Building2 } from "lucide-react"
import { useAuthStore, getAllUsers, addUser } from "@/lib/auth-store"
import { useAppStore } from "@/lib/store"
import { extractFirstNameFromEmail } from "@/lib/utils"
import type { User as UserType, UserRole } from "@/lib/types"

export default function UsersPage() {
  const { user: currentUser } = useAuthStore()
  const { teams } = useAppStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [users, setUsers] = useState<UserType[]>(getAllUsers())

  // New user form state
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState<UserRole>("employee")
  const [newUserDepartment, setNewUserDepartment] = useState("")
  const [newUserTeamId, setNewUserTeamId] = useState("")

  // Redirect if not maintenance user
  if (currentUser?.role !== "maintenance") {
    return (
      <AppShell title="Users" subtitle="Access Denied">
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground text-center max-w-md">
              You don&apos;t have permission to view this page. Only maintenance team members can manage users.
            </p>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      extractFirstNameFromEmail(user.email).toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleAddUser = () => {
    if (!newUserEmail) return

    const newUser: UserType = {
      id: `user-${Date.now()}`,
      name: extractFirstNameFromEmail(newUserEmail),
      email: newUserEmail,
      password: "password123", // Default password
      role: newUserRole,
      department: newUserRole === "employee" ? newUserDepartment : undefined,
      teamId: newUserRole === "maintenance" ? newUserTeamId : undefined,
      avatar: "/diverse-user-avatars.png",
      createdAt: new Date().toISOString(),
    }

    addUser(newUser)
    setUsers([...users, newUser])
    setIsAddDialogOpen(false)
    setNewUserEmail("")
    setNewUserRole("employee")
    setNewUserDepartment("")
    setNewUserTeamId("")
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId))
  }

  const getRoleBadgeStyles = (role: UserRole) => {
    if (role === "maintenance") {
      return "bg-accent/10 text-accent border-accent/30"
    }
    return "bg-chart-1/10 text-chart-1 border-chart-1/30"
  }

  const employeeCount = users.filter((u) => u.role === "employee").length
  const maintenanceCount = users.filter((u) => u.role === "maintenance").length

  return (
    <AppShell title="User Management" subtitle="Manage system users and their roles">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-chart-1/10">
                  <Building2 className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{employeeCount}</p>
                  <p className="text-sm text-muted-foreground">Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Wrench className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{maintenanceCount}</p>
                  <p className="text-sm text-muted-foreground">Maintenance Staff</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>View and manage all registered users</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="employee">Employees</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>
                        Create a new user account. The name will be derived from the email address.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="john.doe@company.com"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                        {newUserEmail && (
                          <p className="text-sm text-muted-foreground">
                            Display name: <span className="font-medium">{extractFirstNameFromEmail(newUserEmail)}</span>
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={newUserRole} onValueChange={(value: UserRole) => setNewUserRole(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {newUserRole === "employee" && (
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            placeholder="e.g., Manufacturing, IT, HR"
                            value={newUserDepartment}
                            onChange={(e) => setNewUserDepartment(e.target.value)}
                          />
                        </div>
                      )}
                      {newUserRole === "maintenance" && (
                        <div className="space-y-2">
                          <Label htmlFor="team">Assign to Team</Label>
                          <Select value={newUserTeamId} onValueChange={setNewUserTeamId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              {teams.map((team) => (
                                <SelectItem key={team.id} value={team.id}>
                                  {team.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddUser} disabled={!newUserEmail}>
                        Create User
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department / Team</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const displayName = extractFirstNameFromEmail(user.email)
                  const team = teams.find((t) => t.id === user.teamId)
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{displayName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleBadgeStyles(user.role)}>
                          {user.role === "maintenance" ? (
                            <Wrench className="h-3 w-3 mr-1" />
                          ) : (
                            <User className="h-3 w-3 mr-1" />
                          )}
                          {user.role === "maintenance" ? "Maintenance" : "Employee"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.role === "employee" ? user.department || "-" : team?.name || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Edit User</DropdownMenuItem>
                            <DropdownMenuItem>Reset Password</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.id === currentUser?.id}
                            >
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </AppShell>
  )
}
