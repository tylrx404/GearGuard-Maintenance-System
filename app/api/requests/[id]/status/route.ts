import { NextResponse } from "next/server"
import type { RequestStatus } from "@/lib/types"

const requestsStore: any[] = []
const equipmentStore: any[] = []

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const newStatus: RequestStatus = body.status

  const index = requestsStore.findIndex((r) => r.id === id)

  if (index === -1) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 })
  }

  const oldStatus = requestsStore[index].status

  // Validate workflow: New -> In Progress -> Repaired OR Scrap
  const validTransitions: Record<RequestStatus, RequestStatus[]> = {
    new: ["in-progress", "scrap"],
    "in-progress": ["repaired", "scrap"],
    repaired: [],
    scrap: [],
  }

  if (!validTransitions[oldStatus].includes(newStatus)) {
    return NextResponse.json(
      {
        error: `Invalid status transition from ${oldStatus} to ${newStatus}`,
      },
      { status: 400 },
    )
  }

  requestsStore[index].status = newStatus
  requestsStore[index].updatedAt = new Date().toISOString()

  // Business logic: If moved to scrap, mark equipment as unusable
  if (newStatus === "scrap") {
    const equipmentId = requestsStore[index].equipmentId
    const eqIndex = equipmentStore.findIndex((e) => e.id === equipmentId)
    if (eqIndex !== -1) {
      equipmentStore[eqIndex].isScrap = true
      equipmentStore[eqIndex].updatedAt = new Date().toISOString()

      // Increment failure count
      equipmentStore[eqIndex].failureCount = (equipmentStore[eqIndex].failureCount || 0) + 1
    }
  }

  // Increment failure count for corrective maintenance when repaired
  if (newStatus === "repaired" && requestsStore[index].type === "corrective") {
    const equipmentId = requestsStore[index].equipmentId
    const eqIndex = equipmentStore.findIndex((e) => e.id === equipmentId)
    if (eqIndex !== -1) {
      equipmentStore[eqIndex].failureCount = (equipmentStore[eqIndex].failureCount || 0) + 1
      equipmentStore[eqIndex].updatedAt = new Date().toISOString()
    }
  }

  return NextResponse.json(requestsStore[index])
}
