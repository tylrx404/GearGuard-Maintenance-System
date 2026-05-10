"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAppStore } from "@/lib/store"
import type { MaintenanceTeam } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Users, MoreVertical, Edit, Trash2, Wrench, UserPlus } from "lucide-react"

interface TeamCardProps {
  team: MaintenanceTeam
  onEdit: (team: MaintenanceTeam) => void
  onManageMembers: (team: MaintenanceTeam) => void
  index: number
}

export function TeamCard({ team, onEdit, onManageMembers, index }: TeamCardProps) {
  const { requests, deleteTeam } = useAppStore()

  const teamRequests = requests.filter((r) => r.teamId === team.id)
  const openRequests = teamRequests.filter((r) => r.status === "new" || r.status === "in-progress").length
  const completedRequests = teamRequests.filter((r) => r.status === "repaired").length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="border-border/50 hover:border-border transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{team.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{team.description}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(team)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Team
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManageMembers(team)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Manage Members
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteTeam(team.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-primary/5">
              <Wrench className="h-3 w-3 mr-1" />
              {openRequests} open
            </Badge>
            <Badge variant="outline" className="bg-success/5 text-success border-success/20">
              {completedRequests} completed
            </Badge>
          </div>

          {/* Members */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Team Members ({team.members.length})
            </p>
            <div className="space-y-2">
              {team.members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs capitalize",
                      member.role === "lead" ? "border-accent/50 text-accent" : "border-muted-foreground/50",
                    )}
                  >
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
