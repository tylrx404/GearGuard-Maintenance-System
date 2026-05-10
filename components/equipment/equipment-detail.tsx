"use client"

import { motion } from "framer-motion"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAppStore } from "@/lib/store"
import { useAuthStore } from "@/lib/auth-store"
import type { Equipment } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  Wrench,
  MapPin,
  Building2,
  Calendar,
  Shield,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
} from "lucide-react"
import Link from "next/link"

interface EquipmentDetailProps {
  open: boolean
  onClose: () => void
  equipment: Equipment | null
}

export function EquipmentDetail({ open, onClose, equipment }: EquipmentDetailProps) {
  const { teams, requests } = useAppStore()
  const { user } = useAuthStore()

  if (!equipment) return null

  const team = teams.find((t) => t.id === equipment.defaultTeamId)
  const technician = team?.members.find((m) => m.id === equipment.defaultTechnicianId)
  const equipmentRequests = requests
    .filter((r) => r.equipmentId === equipment.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const openRequests = equipmentRequests.filter((r) => r.status === "new" || r.status === "in-progress").length

  const isWarrantyExpired = new Date(equipment.warrantyExpiry) < new Date()

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-lg",
                equipment.isScrap
                  ? "bg-destructive/10"
                  : equipment.failureCount >= 5
                    ? "bg-warning/10"
                    : "bg-primary/10",
              )}
            >
              <Wrench
                className={cn(
                  "h-5 w-5",
                  equipment.isScrap
                    ? "text-destructive"
                    : equipment.failureCount >= 5
                      ? "text-warning"
                      : "text-primary",
                )}
              />
            </div>
            <div>
              <span>{equipment.name}</span>
              {equipment.failureCount >= 5 && (
                <div className="flex items-center gap-1 text-xs text-warning font-normal mt-0.5">
                  <AlertTriangle className="h-3 w-3" />
                  Repeat failure equipment
                </div>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              className={cn(equipment.isScrap ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success")}
            >
              {equipment.isScrap ? "Scrapped" : "Operational"}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                isWarrantyExpired ? "border-destructive/50 text-destructive" : "border-success/50 text-success",
              )}
            >
              <Shield className="h-3 w-3 mr-1" />
              Warranty {isWarrantyExpired ? "Expired" : "Active"}
            </Badge>
            {openRequests > 0 && (
              <Badge className="bg-accent/10 text-accent border-accent/20">
                {openRequests} Open Request{openRequests > 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {/* Scrap reason if applicable */}
          {equipment.isScrap && equipment.scrapReason && (
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-xs text-muted-foreground">Scrap Reason</p>
              <p className="text-sm text-destructive">{equipment.scrapReason}</p>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Serial Number</p>
              <p className="font-mono text-sm">{equipment.serialNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Department</p>
              <div className="flex items-center gap-1 text-sm">
                <Building2 className="h-3 w-3 text-muted-foreground" />
                {equipment.department}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Location</p>
              <div className="flex items-center gap-1 text-sm">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                {equipment.location}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Purchase Date</p>
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                {new Date(equipment.purchaseDate).toLocaleDateString()}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Warranty Expiry</p>
              <div className={cn("flex items-center gap-1 text-sm", isWarrantyExpired && "text-destructive")}>
                <Shield className="h-3 w-3" />
                {new Date(equipment.warrantyExpiry).toLocaleDateString()}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Failure Count</p>
              <p className={cn("text-sm font-medium", equipment.failureCount >= 5 && "text-warning")}>
                {equipment.failureCount} incidents
              </p>
            </div>
          </div>

          <Separator />

          {/* Default maintenance assignment */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Default Maintenance Assignment
            </h4>
            {team && (
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="font-medium text-sm">{team.name}</p>
                <p className="text-xs text-muted-foreground">{team.description}</p>
              </div>
            )}
            {technician && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={technician.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {technician.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{technician.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{technician.role}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Maintenance history */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Maintenance History
              </h4>
              {!equipment.isScrap && (
                <Link href={`/requests?equipment=${equipment.id}`}>
                  <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                    <Plus className="h-3 w-3" />
                    New Request
                  </Button>
                </Link>
              )}
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {equipmentRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No maintenance history</p>
              ) : (
                equipmentRequests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                  >
                    <div
                      className={cn(
                        "mt-0.5",
                        request.status === "repaired" && "text-success",
                        request.status === "scrap" && "text-destructive",
                        request.status === "in-progress" && "text-warning",
                        request.status === "new" && "text-primary",
                      )}
                    >
                      {request.status === "repaired" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : request.status === "scrap" ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{request.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            request.type === "corrective"
                              ? "border-accent/50 text-accent"
                              : "border-primary/50 text-primary",
                          )}
                        >
                          {request.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {request.createdByName && (
                        <p className="text-xs text-muted-foreground mt-1">by {request.createdByName}</p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
