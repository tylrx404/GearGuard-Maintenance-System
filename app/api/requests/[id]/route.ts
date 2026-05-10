import { NextResponse } from "next/server"
import type { RequestStatus } from "@/lib/types"

const requestsStore: any[] = []
const equipmentStore: any[] = []

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const maintenanceRequest = requestsStore.find((r) => r.id === id)

  if (!maintenanceRequest) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 })
  }

  return NextResponse.json(maintenanceRequest)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const index = requestsStore.findIndex((r) => r.id === id)

  if (index === -1) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 })
  }

  const oldStatus = requestsStore[index].status
  const newStatus: RequestStatus = body.status

  requestsStore[index] = {
    ...requestsStore[index],
    ...body,
    updatedAt: new Date().toISOString(),
  }

  // Business logic: If moved to scrap, mark equipment as unusable
  if (newStatus === "scrap" && oldStatus !== "scrap") {
    const equipmentId = requestsStore[index].equipmentId
    const eqIndex = equipmentStore.findIndex((e) => e.id === equipmentId)
    if (eqIndex !== -1) {
      equipmentStore[eqIndex].isScrap = true
      equipmentStore[eqIndex].updatedAt = new Date().toISOString()
    }
  }

  return NextResponse.json(requestsStore[index])
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const index = requestsStore.findIndex((r) => r.id === id)

  if (index === -1) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 })
  }

  requestsStore.splice(index, 1)
  return NextResponse.json({ success: true })
}
