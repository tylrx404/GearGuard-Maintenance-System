"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAppStore } from "@/lib/store"
import { useAuthStore, canUserPerformAction } from "@/lib/auth-store"
import type { Equipment } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Search, MoreHorizontal, Eye, Edit, Trash2, Wrench, AlertTriangle, MapPin, Building2, Plus } from "lucide-react"
import Link from "next/link"

interface EquipmentTableProps {
  onEdit: (equipment: Equipment) => void
  onView: (equipment: Equipment) => void
}

export function EquipmentTable({ onEdit, onView }: EquipmentTableProps) {
  const { equipment, requests, deleteEquipment } = useAppStore()
  const { user } = useAuthStore()
  const [search, setSearch] = useState("")

  const canManageEquipment = canUserPerformAction(user, "manage_equipment")

  const filteredEquipment = equipment.filter(
    (eq) =>
      eq.name.toLowerCase().includes(search.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      eq.location.toLowerCase().includes(search.toLowerCase()),
  )

  const getOpenRequestCount = (equipmentId: string) => {
    return requests.filter((r) => r.equipmentId === equipmentId && (r.status === "new" || r.status === "in-progress"))
      .length
  }

  const isWarrantyExpiring = (date: string) => {
    const warrantyDate = new Date(date)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return warrantyDate <= thirtyDaysFromNow && warrantyDate > new Date()
  }

  const isWarrantyExpired = (date: string) => {
    return new Date(date) < new Date()
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search equipment by name, serial number, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-card"
        />
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Equipment</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Warranty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {filteredEquipment.map((eq, index) => {
                const openRequests = getOpenRequestCount(eq.id)
                return (
                  <motion.tr
                    key={eq.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={cn(
                      "border-b border-border hover:bg-muted/30 transition-colors",
                      eq.isScrap && "opacity-60 bg-destructive/5",
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            eq.isScrap ? "bg-destructive/10" : eq.failureCount >= 5 ? "bg-warning/10" : "bg-primary/10",
                          )}
                        >
                          <Wrench
                            className={cn(
                              "h-4 w-4",
                              eq.isScrap ? "text-destructive" : eq.failureCount >= 5 ? "text-warning" : "text-primary",
                            )}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{eq.name}</p>
                          {eq.failureCount >= 5 && (
                            <div className="flex items-center gap-1 text-xs text-warning">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Repeat failures ({eq.failureCount})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{eq.serialNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {eq.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        {eq.department}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          isWarrantyExpired(eq.warrantyExpiry)
                            ? "border-destructive/50 text-destructive bg-destructive/5"
                            : isWarrantyExpiring(eq.warrantyExpiry)
                              ? "border-warning/50 text-warning bg-warning/5"
                              : "border-success/50 text-success bg-success/5",
                        )}
                      >
                        {isWarrantyExpired(eq.warrantyExpiry)
                          ? "Expired"
                          : isWarrantyExpiring(eq.warrantyExpiry)
                            ? "Expiring Soon"
                            : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {eq.isScrap ? (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/20">Scrapped</Badge>
                      ) : openRequests > 0 ? (
                        <Link href={`/requests?equipment=${eq.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 h-7 text-xs border-accent/50 text-accent hover:bg-accent/10 bg-transparent"
                          >
                            <Wrench className="h-3 w-3" />
                            Maintenance ({openRequests})
                          </Button>
                        </Link>
                      ) : (
                        <Badge className="bg-success/10 text-success border-success/20">Operational</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(eq)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {!eq.isScrap && (
                            <DropdownMenuItem asChild>
                              <Link href={`/requests?equipment=${eq.id}`} className="flex items-center">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Request
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {canManageEquipment && (
                            <>
                              <DropdownMenuItem onClick={() => onEdit(eq)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteEquipment(eq.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
        {filteredEquipment.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No equipment found matching your search.</div>
        )}
      </div>
    </div>
  )
}
