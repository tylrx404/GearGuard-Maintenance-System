"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { TeamCard } from "@/components/teams/team-card"
import { TeamForm } from "@/components/teams/team-form"
import { MemberForm } from "@/components/teams/member-form"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { useAuthStore, canUserPerformAction } from "@/lib/auth-store"
import type { MaintenanceTeam } from "@/lib/types"
import { Plus, ShieldAlert } from "lucide-react"
import { useEffect } from "react"

export default function TeamsPage() {
  const router = useRouter()
  const { teams } = useAppStore()
  const { user } = useAuthStore()
  const [formOpen, setFormOpen] = useState(false)
  const [memberFormOpen, setMemberFormOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<MaintenanceTeam | null>(null)

  const canManageTeams = canUserPerformAction(user, "manage_teams")

  // Redirect employees away from this page
  useEffect(() => {
    if (user && !canManageTeams) {
      router.push("/")
    }
  }, [user, canManageTeams, router])

  // Show loading or redirect message for employees
  if (!canManageTeams) {
    return (
      <AppShell title="Access Denied" subtitle="You don't have permission to view this page">
        <div className="flex flex-col items-center justify-center py-20">
          <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground text-center max-w-md">
            The Teams management section is only available to maintenance team members.
          </p>
        </div>
      </AppShell>
    )
  }

  const handleEdit = (team: MaintenanceTeam) => {
    setSelectedTeam(team)
    setFormOpen(true)
  }

  const handleManageMembers = (team: MaintenanceTeam) => {
    setSelectedTeam(team)
    setMemberFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setSelectedTeam(null)
  }

  const handleCloseMemberForm = () => {
    setMemberFormOpen(false)
    setSelectedTeam(null)
  }

  return (
    <AppShell title="Maintenance Teams" subtitle="Manage teams and technicians">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {teams.map((team, index) => (
            <TeamCard
              key={team.id}
              team={team}
              onEdit={handleEdit}
              onManageMembers={handleManageMembers}
              index={index}
            />
          ))}
        </div>

        {teams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No teams created yet. Create your first team to get started.</p>
          </div>
        )}

        <TeamForm open={formOpen} onClose={handleCloseForm} team={selectedTeam} />
        <MemberForm open={memberFormOpen} onClose={handleCloseMemberForm} team={selectedTeam} />
      </motion.div>
    </AppShell>
  )
}
