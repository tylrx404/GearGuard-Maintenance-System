"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppStore } from "@/lib/store"
import type { MaintenanceTeam, TeamMember } from "@/lib/types"
import { X, UserPlus, Crown, AlertTriangle } from "lucide-react"

interface MemberFormProps {
  open: boolean
  onClose: () => void
  team: MaintenanceTeam | null
}

interface FormData {
  name: string
  email: string
  role: "lead" | "technician"
}

export function MemberForm({ open, onClose, team }: MemberFormProps) {
  const { updateTeam } = useAppStore()
  const [showAddForm, setShowAddForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      role: "technician",
    },
  })

  if (!team) return null

  const currentLead = team.members.find((m) => m.role === "lead")
  const selectedRole = watch("role")

  const onSubmit = (data: FormData) => {
    let updatedMembers = [...team.members]

    if (data.role === "lead" && currentLead) {
      updatedMembers = updatedMembers.map((m) => (m.id === currentLead.id ? { ...m, role: "technician" as const } : m))
    }

    const newMember: TeamMember = {
      id: `tech-${Date.now()}`,
      ...data,
    }

    updateTeam(team.id, {
      members: [...updatedMembers, newMember],
    })
    reset()
    setShowAddForm(false)
  }

  const removeMember = (memberId: string) => {
    updateTeam(team.id, {
      members: team.members.filter((m) => m.id !== memberId),
    })
  }

  const promoteToLead = (memberId: string) => {
    const updatedMembers = team.members.map((m) => {
      if (m.id === memberId) {
        return { ...m, role: "lead" as const }
      }
      if (m.role === "lead") {
        return { ...m, role: "technician" as const }
      }
      return m
    })
    updateTeam(team.id, { members: updatedMembers })
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Manage Team Members</SheetTitle>
          <p className="text-sm text-muted-foreground">{team.name}</p>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Current members */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Current Members ({team.members.length})
            </p>
            <AnimatePresence>
              {team.members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === "lead" ? (
                      <Badge variant="outline" className="text-xs border-accent/50 text-accent bg-accent/5 gap-1">
                        <Crown className="h-3 w-3" />
                        Lead
                      </Badge>
                    ) : (
                      <>
                        <Badge variant="outline" className="text-xs capitalize border-muted-foreground/50">
                          {member.role}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-accent hover:text-accent"
                          onClick={() => promoteToLead(member.id)}
                        >
                          <Crown className="h-3 w-3 mr-1" />
                          Promote
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeMember(member.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {team.members.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No members in this team yet</p>
            )}
          </div>

          <Separator />

          {/* Add member form */}
          {showAddForm ? (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 p-4 rounded-lg border border-border bg-card"
            >
              {selectedRole === "lead" && currentLead && (
                <Alert className="border-warning/30 bg-warning/5">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <AlertDescription className="text-warning text-sm">
                    {currentLead.name} will be demoted to technician when you assign a new lead.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="memberName">Name *</Label>
                <Input
                  id="memberName"
                  {...register("name", { required: "Name is required" })}
                  placeholder="Full name"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="memberEmail">Email *</Label>
                <Input
                  id="memberEmail"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  placeholder="email@company.com"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="memberRole">Role *</Label>
                <Select value={watch("role")} onValueChange={(value: "lead" | "technician") => setValue("role", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">
                      <div className="flex items-center gap-2">
                        <Crown className="h-3 w-3 text-accent" />
                        Team Lead
                      </div>
                    </SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Add Member
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </motion.form>
          ) : (
            <Button variant="outline" className="w-full gap-2 bg-transparent" onClick={() => setShowAddForm(true)}>
              <UserPlus className="h-4 w-4" />
              Add New Member
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
