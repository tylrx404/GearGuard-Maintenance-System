"use client"

import { useState, useCallback } from "react"
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { KanbanColumn } from "./kanban-column"
import { RequestCard } from "./request-card"
import { useAppStore } from "@/lib/store"
import { useAuthStore, canUserPerformAction } from "@/lib/auth-store"
import type { MaintenanceRequest, RequestStatus } from "@/lib/types"

const columns: { id: RequestStatus; title: string; color: string }[] = [
  { id: "new", title: "New", color: "bg-chart-1" },
  { id: "in-progress", title: "In Progress", color: "bg-warning" },
  { id: "repaired", title: "Repaired", color: "bg-success" },
  { id: "scrap", title: "Scrap", color: "bg-destructive" },
]

interface KanbanBoardProps {
  userRequests?: MaintenanceRequest[]
}

export function KanbanBoard({ userRequests }: KanbanBoardProps) {
  const { requests, updateRequestStatus, updateEquipment, equipment } = useAppStore()
  const { user } = useAuthStore()
  const [activeRequest, setActiveRequest] = useState<MaintenanceRequest | null>(null)

  const canUpdateStatus = canUserPerformAction(user, "update_request_status")

  const displayRequests = userRequests || requests

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const getRequestsByStatus = useCallback(
    (status: RequestStatus): MaintenanceRequest[] => {
      return displayRequests.filter((r) => r.status === status)
    },
    [displayRequests],
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (!canUpdateStatus) return
      const request = displayRequests.find((r) => r.id === event.active.id)
      if (request) {
        setActiveRequest(request)
      }
    },
    [canUpdateStatus, displayRequests],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      // Always clear active request first
      setActiveRequest(null)

      if (!canUpdateStatus) {
        return
      }

      const { active, over } = event

      // Ensure we have a valid drop target
      if (!over) {
        return
      }

      const activeId = active.id as string
      const overId = over.id as string

      // Find the request being dragged
      const request = displayRequests.find((r) => r.id === activeId)
      if (!request) {
        return
      }

      let newStatus: RequestStatus

      // Check if dropped on a column
      if (columns.some((col) => col.id === overId)) {
        newStatus = overId as RequestStatus
      } else {
        // Dropped on another request - find which column that request is in
        const targetRequest = displayRequests.find((r) => r.id === overId)
        if (targetRequest) {
          newStatus = targetRequest.status
        } else {
          return
        }
      }

      // Only update if status actually changed
      if (request.status !== newStatus) {
        updateRequestStatus(activeId, newStatus)

        // If moved to scrap, mark equipment as unusable
        if (newStatus === "scrap") {
          const eq = equipment.find((e) => e.id === request.equipmentId)
          if (eq && !eq.isScrap) {
            updateEquipment(eq.id, {
              isScrap: true,
              scrapReason: `Scrapped via maintenance request: ${request.subject}`,
            })
          }
        }
      }
    },
    [canUpdateStatus, displayRequests, equipment, updateRequestStatus, updateEquipment],
  )

  const handleDragCancel = useCallback(() => {
    setActiveRequest(null)
  }, [])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            requests={getRequestsByStatus(column.id)}
            canDrag={canUpdateStatus}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeRequest && (
          <div className="rotate-3 scale-105">
            <RequestCard request={activeRequest} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
