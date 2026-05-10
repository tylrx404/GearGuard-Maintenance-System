"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { KanbanBoard } from "@/components/requests/kanban-board"
import { RequestForm } from "@/components/requests/request-form"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAppStore } from "@/lib/store"
import { useAuthStore, canUserPerformAction } from "@/lib/auth-store"
import type { MaintenanceRequest } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Plus, Kanban, List, Search, Calendar, AlertTriangle, Info, User } from "lucide-react"

const statusStyles = {
  new: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  "in-progress": "bg-warning/10 text-warning border-warning/20",
  repaired: "bg-success/10 text-success border-success/20",
  scrap: "bg-destructive/10 text-destructive border-destructive/20",
}

export default function RequestsPage() {
  const searchParams = useSearchParams()
  const preselectedEquipmentId = searchParams.get("equipment") || undefined
  const { requests } = useAppStore()
  const { user } = useAuthStore()
  const [formOpen, setFormOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null)
  const [view, setView] = useState<"kanban" | "list">("kanban")
  const [search, setSearch] = useState("")

  const canViewAll = canUserPerformAction(user, "view_all_requests")
  const canUpdateStatus = canUserPerformAction(user, "update_request_status")

  // Filter requests based on user role
  const visibleRequests = useMemo(() => {
    if (canViewAll) {
      return requests
    }
    // Employees can only see their own requests
    return requests.filter((r) => r.createdBy === user?.id)
  }, [requests, user, canViewAll])

  const filteredRequests = visibleRequests.filter(
    (r) =>
      r.subject.toLowerCase().includes(search.toLowerCase()) ||
      r.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
      r.technicianName.toLowerCase().includes(search.toLowerCase()),
  )

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== "repaired" && status !== "scrap"
  }

  // Determine subtitle based on role
  const getSubtitle = () => {
    if (canViewAll) {
      return "Track and manage all maintenance work"
    }
    return "View and track your submitted maintenance requests"
  }

  return (
    <AppShell title="Maintenance Requests" subtitle={getSubtitle()}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Role-based info banner */}
        {!canViewAll && (
          <Alert className="border-chart-1/30 bg-chart-1/5">
            <Info className="h-4 w-4 text-chart-1" />
            <AlertDescription className="text-chart-1">
              You are viewing your own submitted requests. Contact maintenance team for status updates.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {/* Only show Kanban view for maintenance users who can update status */}
          {canUpdateStatus ? (
            <Tabs value={view} onValueChange={(v) => setView(v as "kanban" | "list")}>
              <TabsList>
                <TabsTrigger value="kanban" className="gap-2">
                  <Kanban className="h-4 w-4" />
                  Kanban
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              Showing {visibleRequests.length} request(s) you created
            </div>
          )}

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64 pl-9 bg-card"
              />
            </div>
            <Button onClick={() => setFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </div>
        </div>

        {canUpdateStatus && view === "kanban" ? (
          <KanbanBoard userRequests={visibleRequests} />
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Subject</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    className={cn(
                      "hover:bg-muted/30 cursor-pointer",
                      isOverdue(request.dueDate, request.status) && "bg-destructive/5",
                    )}
                    onClick={() => {
                      setSelectedRequest(request)
                      setFormOpen(true)
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{request.subject}</span>
                        {isOverdue(request.dueDate, request.status) && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{request.equipmentName}</TableCell>
                    <TableCell className="text-muted-foreground">{request.teamName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={request.technicianAvatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {request.technicianName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{request.technicianName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          request.type === "corrective"
                            ? "border-accent/50 text-accent"
                            : "border-primary/50 text-primary",
                        )}
                      >
                        {request.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "flex items-center gap-1 text-sm",
                          isOverdue(request.dueDate, request.status) ? "text-destructive" : "text-muted-foreground",
                        )}
                      >
                        <Calendar className="h-3 w-3" />
                        {new Date(request.dueDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("capitalize", statusStyles[request.status])}>
                        {request.status.replace("-", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredRequests.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                {visibleRequests.length === 0 ? "You haven't created any requests yet." : "No requests found."}
              </div>
            )}
          </div>
        )}

        <RequestForm
          open={formOpen}
          onClose={() => {
            setFormOpen(false)
            setSelectedRequest(null)
          }}
          request={selectedRequest}
          preselectedEquipmentId={preselectedEquipmentId}
        />
      </motion.div>
    </AppShell>
  )
}
