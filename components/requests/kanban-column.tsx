"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { RequestCard } from "./request-card"
import type { MaintenanceRequest, RequestStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
  id: RequestStatus
  title: string
  requests: MaintenanceRequest[]
  color: string
  canDrag?: boolean
}

export function KanbanColumn({ id, title, requests, color, canDrag = true }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col min-h-[500px] w-full md:w-80 flex-shrink-0 rounded-xl bg-muted/30 border border-border/50 transition-colors",
        isOver && canDrag && "bg-muted/50 border-primary/30",
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", color)} />
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <Badge variant="secondary" className="font-mono text-xs">
          {requests.length}
        </Badge>
      </div>

      <SortableContext items={requests.map((r) => r.id)} strategy={verticalListSortingStrategy}>
        <motion.div layout className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} canDrag={canDrag} />
          ))}
          {requests.length === 0 && (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border-2 border-dashed border-border/50 rounded-lg">
              {canDrag ? "Drag requests here" : "No requests"}
            </div>
          )}
        </motion.div>
      </SortableContext>
    </div>
  )
}
