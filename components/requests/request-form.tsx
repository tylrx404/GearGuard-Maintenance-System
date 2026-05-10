"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppStore } from "@/lib/store"
import { useAuthStore, canUserPerformAction } from "@/lib/auth-store"
import { extractFirstNameFromEmail } from "@/lib/utils"
import type { MaintenanceRequest, RequestType, RequestStatus } from "@/lib/types"
import { Wrench, Shield, Zap, Lock, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface RequestFormProps {
  open: boolean
  onClose: () => void
  request?: MaintenanceRequest | null
  preselectedEquipmentId?: string
  preselectedDate?: string
}

interface FormData {
  subject: string
  description: string
  type: RequestType
  equipmentId: string
  technicianId: string
  scheduledDate: string
  dueDate: string
  duration?: number
  status?: RequestStatus
  notes?: string
}

const statusOptions: { value: RequestStatus; label: string; color: string }[] = [
  { value: "new", label: "New", color: "bg-chart-1" },
  { value: "in-progress", label: "In Progress", color: "bg-warning" },
  { value: "repaired", label: "Repaired", color: "bg-success" },
  { value: "scrap", label: "Scrap", color: "bg-destructive" },
]

export function RequestForm({ open, onClose, request, preselectedEquipmentId, preselectedDate }: RequestFormProps) {
  const { equipment, teams, addRequest, updateRequest, updateEquipment } = useAppStore()
  const { user } = useAuthStore()

  const canUpdateStatus = canUserPerformAction(user, "update_request_status")
  const canAddNotes = canUserPerformAction(user, "add_notes")

  const activeEquipment = equipment.filter((e) => !e.isScrap)

  const currentUserDisplayName = user?.email ? extractFirstNameFromEmail(user.email) : "User"

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      subject: "",
      description: "",
      type: "corrective",
      equipmentId: "",
      technicianId: "",
      scheduledDate: "",
      dueDate: "",
    },
  })

  const selectedEquipmentId = watch("equipmentId")
  const selectedStatus = watch("status")
  const selectedEquipment = activeEquipment.find((e) => e.id === selectedEquipmentId)
  const selectedTeam = teams.find((t) => t.id === selectedEquipment?.defaultTeamId)

  // Check if user is the owner of the request
  const isOwner = request?.createdBy === user?.id
  const isEditing = !!request

  // Determine if user can edit the form
  const canEditForm = !isEditing || canUpdateStatus || isOwner

  // Auto-fill when equipment is selected
  useEffect(() => {
    if (selectedEquipment && !request) {
      if (selectedEquipment.defaultTechnicianId) {
        setValue("technicianId", selectedEquipment.defaultTechnicianId)
      }
    }
  }, [selectedEquipment, setValue, request])

  // Set preselected values
  useEffect(() => {
    if (preselectedEquipmentId && !request) {
      setValue("equipmentId", preselectedEquipmentId)
    }
    if (preselectedDate && !request) {
      setValue("scheduledDate", preselectedDate)
      setValue("dueDate", preselectedDate)
    }
  }, [preselectedEquipmentId, preselectedDate, setValue, request])

  useEffect(() => {
    if (request) {
      reset({
        subject: request.subject,
        description: request.description,
        type: request.type,
        equipmentId: request.equipmentId,
        technicianId: request.technicianId,
        scheduledDate: request.scheduledDate,
        dueDate: request.dueDate,
        duration: request.duration,
        status: request.status,
        notes: request.notes,
      })
    } else {
      reset({
        subject: "",
        description: "",
        type: "corrective",
        equipmentId: preselectedEquipmentId || "",
        technicianId: "",
        scheduledDate: preselectedDate || "",
        dueDate: preselectedDate || "",
      })
    }
  }, [request, reset, preselectedEquipmentId, preselectedDate])

  const onSubmit = (data: FormData) => {
    const eq =
      activeEquipment.find((e) => e.id === data.equipmentId) || equipment.find((e) => e.id === data.equipmentId)
    const team = teams.find((t) => t.id === eq?.defaultTeamId)
    const tech = team?.members.find((m) => m.id === data.technicianId)

    if (!eq || !team || !tech) return

    if (request) {
      const updates: Partial<MaintenanceRequest> = {
        ...data,
        equipmentName: eq.name,
        teamId: team.id,
        teamName: team.name,
        technicianName: tech.name,
        technicianAvatar: tech.avatar,
        location: eq.location,
      }

      // Only maintenance can update status
      if (canUpdateStatus && data.status) {
        updates.status = data.status

        // If status changed to scrap, update equipment
        if (data.status === "scrap" && request.status !== "scrap") {
          updateEquipment(eq.id, {
            isScrap: true,
            scrapReason: `Scrapped via maintenance request: ${request.subject}`,
          })
        }
      }

      updateRequest(request.id, updates)
    } else {
      const newRequest: MaintenanceRequest = {
        id: `req-${Date.now()}`,
        ...data,
        equipmentName: eq.name,
        teamId: team.id,
        teamName: team.name,
        technicianId: tech.id,
        technicianName: tech.name,
        technicianAvatar: tech.avatar,
        location: eq.location,
        status: "new",
        createdBy: user?.id || "",
        createdByName: currentUserDisplayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addRequest(newRequest)
    }
    onClose()
  }

  const getCreatorDisplayName = () => {
    if (!request) return currentUserDisplayName
    if (request.createdBy === user?.id && user?.email) {
      return extractFirstNameFromEmail(user.email)
    }
    return request.createdByName
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {request ? "View Request" : "Create Maintenance Request"}
            {request && !canUpdateStatus && !isOwner && (
              <Badge variant="outline" className="ml-2 gap-1">
                <Lock className="h-3 w-3" />
                Read Only
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Role-based info for editing */}
        {request && !canUpdateStatus && (
          <Alert className="border-chart-1/30 bg-chart-1/5">
            <Info className="h-4 w-4 text-chart-1" />
            <AlertDescription className="text-chart-1">
              Only maintenance team members can update request status and workflow.
            </AlertDescription>
          </Alert>
        )}

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Status management - only for maintenance when editing */}
          {request && canUpdateStatus && (
            <div className="space-y-2 p-4 rounded-lg bg-accent/5 border border-accent/20">
              <Label className="flex items-center gap-2 text-accent">
                <Wrench className="h-4 w-4" />
                Workflow Status (Maintenance Only)
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue("status", option.value)}
                    className={cn(
                      "p-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                      selectedStatus === option.value
                        ? "border-accent bg-accent/10"
                        : "border-border bg-transparent hover:border-muted-foreground",
                    )}
                  >
                    <div className={cn("w-2 h-2 rounded-full", option.color)} />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
              {selectedStatus === "scrap" && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Marking as scrap will make the equipment unusable for future requests.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Request type */}
          <div className="space-y-2">
            <Label>Request Type *</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => canEditForm && setValue("type", "corrective")}
                disabled={!canEditForm}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all flex items-center gap-3",
                  watch("type") === "corrective"
                    ? "border-accent bg-accent/10"
                    : "border-border bg-transparent hover:border-muted-foreground",
                  !canEditForm && "opacity-60 cursor-not-allowed",
                )}
              >
                <div className="p-2 rounded-lg bg-accent/20">
                  <Wrench className="h-5 w-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Corrective</p>
                  <p className="text-xs text-muted-foreground">Breakdown repair</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => canEditForm && setValue("type", "preventive")}
                disabled={!canEditForm}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all flex items-center gap-3",
                  watch("type") === "preventive"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-transparent hover:border-muted-foreground",
                  !canEditForm && "opacity-60 cursor-not-allowed",
                )}
              >
                <div className="p-2 rounded-lg bg-primary/20">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Preventive</p>
                  <p className="text-xs text-muted-foreground">Routine maintenance</p>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Equipment selection */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="equipmentId">Equipment *</Label>
              <Select
                value={selectedEquipmentId}
                onValueChange={(value) => canEditForm && setValue("equipmentId", value)}
                disabled={!canEditForm || isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {activeEquipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name} - {eq.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Auto-filled fields */}
            {selectedEquipment && (
              <div className="md:col-span-2 p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
                <div className="flex items-center gap-2 text-primary text-sm font-medium">
                  <Zap className="h-4 w-4" />
                  Auto-filled from equipment defaults
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Maintenance Team</p>
                    <p className="font-medium">{selectedTeam?.name || "Not assigned"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Location</p>
                    <p className="font-medium">{selectedEquipment.location}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                {...register("subject", { required: "Subject is required" })}
                placeholder="Brief description of the issue"
                disabled={!canEditForm}
              />
              {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Detailed description of the maintenance needed"
                rows={3}
                disabled={!canEditForm}
              />
            </div>

            {selectedTeam && (
              <div className="space-y-2">
                <Label htmlFor="technicianId">Assigned Technician *</Label>
                <Select
                  value={watch("technicianId")}
                  onValueChange={(value) => (canEditForm || canUpdateStatus) && setValue("technicianId", value)}
                  disabled={!canEditForm && !canUpdateStatus}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTeam.members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date *</Label>
              <Input
                id="scheduledDate"
                type="date"
                {...register("scheduledDate", {
                  required: "Scheduled date is required",
                })}
                disabled={!canEditForm && !canUpdateStatus}
              />
              {errors.scheduledDate && <p className="text-xs text-destructive">{errors.scheduledDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                {...register("dueDate", { required: "Due date is required" })}
                disabled={!canEditForm && !canUpdateStatus}
              />
              {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                step="0.5"
                {...register("duration", { valueAsNumber: true })}
                placeholder="Estimated hours"
                disabled={!canEditForm && !canUpdateStatus}
              />
            </div>

            {/* Notes - maintenance only */}
            {canAddNotes && request && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes" className="flex items-center gap-2">
                  Maintenance Notes
                  <Badge variant="outline" className="text-xs">
                    Maintenance Only
                  </Badge>
                </Label>
                <Textarea
                  id="notes"
                  {...register("notes")}
                  placeholder="Add updates, findings, or notes about this request..."
                  rows={2}
                />
              </div>
            )}

            {/* Show created by info - uses dynamic name */}
            {request && (
              <div className="md:col-span-2 p-3 rounded-lg bg-secondary/50 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>
                    Created by: <span className="font-medium text-foreground">{getCreatorDisplayName()}</span>
                  </span>
                  <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {canEditForm || canUpdateStatus ? "Cancel" : "Close"}
            </Button>
            {(canEditForm || canUpdateStatus) && (
              <Button type="submit">{request ? "Update Request" : "Create Request"}</Button>
            )}
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  )
}
