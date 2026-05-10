"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { EquipmentTable } from "@/components/equipment/equipment-table"
import { EquipmentForm } from "@/components/equipment/equipment-form"
import { EquipmentDetail } from "@/components/equipment/equipment-detail"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthStore, canUserPerformAction } from "@/lib/auth-store"
import { Plus, Info } from "lucide-react"
import type { Equipment } from "@/lib/types"

export default function EquipmentPage() {
  const { user } = useAuthStore()
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)

  const canManageEquipment = canUserPerformAction(user, "manage_equipment")

  const handleEdit = (equipment: Equipment) => {
    if (!canManageEquipment) {
      // For employees, just view the detail
      handleView(equipment)
      return
    }
    setSelectedEquipment(equipment)
    setFormOpen(true)
  }

  const handleView = (equipment: Equipment) => {
    setSelectedEquipment(equipment)
    setDetailOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setSelectedEquipment(null)
  }

  const handleCloseDetail = () => {
    setDetailOpen(false)
    setSelectedEquipment(null)
  }

  return (
    <AppShell
      title="Equipment"
      subtitle={
        canManageEquipment ? "Manage all equipment and assets" : "View equipment and create maintenance requests"
      }
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {!canManageEquipment && (
          <Alert className="border-chart-1/30 bg-chart-1/5">
            <Info className="h-4 w-4 text-chart-1" />
            <AlertDescription className="text-chart-1">
              You can view equipment details and create maintenance requests. Equipment management is available to
              maintenance team only.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          {canManageEquipment && (
            <Button onClick={() => setFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Equipment
            </Button>
          )}
        </div>

        <EquipmentTable onEdit={handleEdit} onView={handleView} />

        {canManageEquipment && (
          <EquipmentForm open={formOpen} onClose={handleCloseForm} equipment={selectedEquipment} />
        )}

        <EquipmentDetail open={detailOpen} onClose={handleCloseDetail} equipment={selectedEquipment} />
      </motion.div>
    </AppShell>
  )
}
