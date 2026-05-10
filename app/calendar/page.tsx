"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { AppShell } from "@/components/app-shell"
import { MaintenanceCalendar } from "@/components/calendar/maintenance-calendar"
import { RequestForm } from "@/components/requests/request-form"
import type { MaintenanceRequest } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"

export default function CalendarPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | undefined>()

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
    setSelectedRequest(null)
    setFormOpen(true)
  }

  const handleEventClick = (request: MaintenanceRequest) => {
    setSelectedRequest(request)
    setSelectedDate(undefined)
    setFormOpen(true)
  }

  return (
    <AppShell title="Maintenance Calendar" subtitle="Schedule and track preventive maintenance">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 bg-primary/5 border-primary/20 text-primary">
            <Shield className="h-3 w-3" />
            Preventive maintenance only
          </Badge>
          <span className="text-sm text-muted-foreground">Click on any date to schedule new maintenance</span>
        </div>

        <MaintenanceCalendar onDateClick={handleDateClick} onEventClick={handleEventClick} />

        <RequestForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false)
            setSelectedRequest(null)
            setSelectedDate(undefined)
          }}
          request={selectedRequest}
          preselectedDate={selectedDate}
        />
      </motion.div>
    </AppShell>
  )
}
