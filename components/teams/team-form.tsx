"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAppStore } from "@/lib/store"
import type { MaintenanceTeam } from "@/lib/types"

interface TeamFormProps {
  open: boolean
  onClose: () => void
  team?: MaintenanceTeam | null
}

interface FormData {
  name: string
  description: string
}

export function TeamForm({ open, onClose, team }: TeamFormProps) {
  const { addTeam, updateTeam } = useAppStore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
    },
  })

  useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        description: team.description,
      })
    } else {
      reset({
        name: "",
        description: "",
      })
    }
  }, [team, reset])

  const onSubmit = (data: FormData) => {
    if (team) {
      updateTeam(team.id, data)
    } else {
      const newTeam: MaintenanceTeam = {
        id: `team-${Date.now()}`,
        ...data,
        members: [],
        createdAt: new Date().toISOString(),
      }
      addTeam(newTeam)
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{team ? "Edit Team" : "Create New Team"}</DialogTitle>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Team Name *</Label>
            <Input
              id="name"
              {...register("name", { required: "Team name is required" })}
              placeholder="e.g., IT Support, Mechanics"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of the team's responsibilities"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{team ? "Update Team" : "Create Team"}</Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  )
}
