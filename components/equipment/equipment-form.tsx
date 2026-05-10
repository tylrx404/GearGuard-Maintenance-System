"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useAppStore } from "@/lib/store"
import type { Equipment } from "@/lib/types"

interface EquipmentFormProps {
  open: boolean
  onClose: () => void
  equipment?: Equipment | null
}

interface FormData {
  name: string
  serialNumber: string
  purchaseDate: string
  warrantyExpiry: string
  location: string
  department: string
  assignedEmployee: string
  defaultTeamId: string
  defaultTechnicianId: string
  isScrap: boolean
}

export function EquipmentForm({ open, onClose, equipment }: EquipmentFormProps) {
  const { teams, addEquipment, updateEquipment } = useAppStore()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      serialNumber: "",
      purchaseDate: "",
      warrantyExpiry: "",
      location: "",
      department: "",
      assignedEmployee: "",
      defaultTeamId: "",
      defaultTechnicianId: "",
      isScrap: false,
    },
  })

  const selectedTeamId = watch("defaultTeamId")
  const selectedTeam = teams.find((t) => t.id === selectedTeamId)

  useEffect(() => {
    if (equipment) {
      reset({
        name: equipment.name,
        serialNumber: equipment.serialNumber,
        purchaseDate: equipment.purchaseDate,
        warrantyExpiry: equipment.warrantyExpiry,
        location: equipment.location,
        department: equipment.department,
        assignedEmployee: equipment.assignedEmployee || "",
        defaultTeamId: equipment.defaultTeamId,
        defaultTechnicianId: equipment.defaultTechnicianId || "",
        isScrap: equipment.isScrap,
      })
    } else {
      reset({
        name: "",
        serialNumber: "",
        purchaseDate: "",
        warrantyExpiry: "",
        location: "",
        department: "",
        assignedEmployee: "",
        defaultTeamId: "",
        defaultTechnicianId: "",
        isScrap: false,
      })
    }
  }, [equipment, reset])

  const onSubmit = (data: FormData) => {
    if (equipment) {
      updateEquipment(equipment.id, data)
    } else {
      const newEquipment: Equipment = {
        id: `eq-${Date.now()}`,
        ...data,
        failureCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      addEquipment(newEquipment)
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{equipment ? "Edit Equipment" : "Add New Equipment"}</DialogTitle>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Equipment Name *</Label>
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                placeholder="e.g., CNC Milling Machine"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number *</Label>
              <Input
                id="serialNumber"
                {...register("serialNumber", {
                  required: "Serial number is required",
                })}
                placeholder="e.g., CNC-2024-001"
              />
              {errors.serialNumber && <p className="text-xs text-destructive">{errors.serialNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date *</Label>
              <Input
                id="purchaseDate"
                type="date"
                {...register("purchaseDate", {
                  required: "Purchase date is required",
                })}
              />
              {errors.purchaseDate && <p className="text-xs text-destructive">{errors.purchaseDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="warrantyExpiry">Warranty Expiry *</Label>
              <Input
                id="warrantyExpiry"
                type="date"
                {...register("warrantyExpiry", {
                  required: "Warranty expiry is required",
                })}
              />
              {errors.warrantyExpiry && <p className="text-xs text-destructive">{errors.warrantyExpiry.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                {...register("location", { required: "Location is required" })}
                placeholder="e.g., Building A - Floor 2"
              />
              {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                {...register("department", {
                  required: "Department is required",
                })}
                placeholder="e.g., Manufacturing"
              />
              {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedEmployee">Assigned Employee</Label>
              <Input id="assignedEmployee" {...register("assignedEmployee")} placeholder="Optional" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultTeamId">Default Maintenance Team *</Label>
              <Select
                value={selectedTeamId}
                onValueChange={(value) => {
                  setValue("defaultTeamId", value)
                  setValue("defaultTechnicianId", "")
                }}
              >
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

            {selectedTeam && (
              <div className="space-y-2">
                <Label htmlFor="defaultTechnicianId">Default Technician</Label>
                <Select
                  value={watch("defaultTechnicianId")}
                  onValueChange={(value) => setValue("defaultTechnicianId", value)}
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
          </div>

          {equipment && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <Switch checked={watch("isScrap")} onCheckedChange={(checked) => setValue("isScrap", checked)} />
              <div>
                <Label>Mark as Scrapped</Label>
                <p className="text-xs text-muted-foreground">
                  Scrapped equipment cannot receive new maintenance requests
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{equipment ? "Update Equipment" : "Add Equipment"}</Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  )
}
