import { NextResponse } from "next/server"
import type { MaintenanceRequest } from "@/lib/types"

const requestsStore: MaintenanceRequest[] = []

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const equipmentId = searchParams.get("equipmentId")
  const status = searchParams.get("status")
  const type = searchParams.get("type")

  let filteredRequests = [...requestsStore]

  if (equipmentId) {
    filteredRequests = filteredRequests.filter((r) => r.equipmentId === equipmentId)
  }

  if (status) {
    filteredRequests = filteredRequests.filter((r) => r.status === status)
  }

  if (type) {
    filteredRequests = filteredRequests.filter((r) => r.type === type)
  }

  return NextResponse.json(filteredRequests)
}

export async function POST(request: Request) {
  const body = await request.json()

  const newRequest: MaintenanceRequest = {
    id: `req-${Date.now()}`,
    subject: body.subject,
    description: body.description,
    type: body.type,
    equipmentId: body.equipmentId,
    equipmentName: body.equipmentName,
    teamId: body.teamId,
    teamName: body.teamName,
    technicianId: body.technicianId,
    technicianName: body.technicianName,
    technicianAvatar: body.technicianAvatar,
    location: body.location,
    scheduledDate: body.scheduledDate,
    dueDate: body.dueDate,
    duration: body.duration,
    status: "new",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  requestsStore.push(newRequest)
  return NextResponse.json(newRequest, { status: 201 })
}
