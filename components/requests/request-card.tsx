"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { MaintenanceRequest } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Calendar, Clock, AlertTriangle, Wrench, Shield, User } from "lucide-react"

interface RequestCardProps {
  request: MaintenanceRequest
  isDragging?: boolean
  canDrag?: boolean
}

export function RequestCard({ request, isDragging, canDrag = true }: RequestCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: request.id,
    disabled: !canDrag,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue =
    new Date(request.dueDate) < new Date() && request.status !== "repaired" && request.status !== "scrap"

  const technicianInitials = request.technicianName
    ? request.technicianName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?"

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...(canDrag ? { ...attributes, ...listeners } : {})}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDragging || isSortableDragging ? 0.5 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        (isDragging || isSortableDragging) && "opacity-50 z-50",
      )}
    >
      <Card
        className={cn(
          "border-border/50 hover:border-border transition-all hover:shadow-md",
          isOverdue && "ring-2 ring-destructive/50 bg-destructive/5",
        )}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header with type badge */}
          <div className="flex items-start justify-between gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                request.type === "corrective"
                  ? "border-accent/50 text-accent bg-accent/5"
                  : "border-primary/50 text-primary bg-primary/5",
              )}
            >
              {request.type === "corrective" ? (
                <Wrench className="h-3 w-3 mr-1" />
              ) : (
                <Shield className="h-3 w-3 mr-1" />
              )}
              {request.type}
            </Badge>
            {isOverdue && <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />}
          </div>

          {/* Subject */}
          <p className="font-medium text-sm line-clamp-2">{request.subject}</p>

          {/* Equipment */}
          <p className="text-xs text-muted-foreground truncate">{request.equipmentName}</p>

          {/* Created by info - uses dynamic createdByName */}
          {request.createdByName && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              <span>by {request.createdByName}</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={request.technicianAvatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">{technicianInitials}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate max-w-[80px]">{request.technicianName}</span>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {request.duration ? (
                <>
                  <Clock className="h-3 w-3" />
                  {request.duration}h
                </>
              ) : (
                <>
                  <Calendar className="h-3 w-3" />
                  {new Date(request.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
