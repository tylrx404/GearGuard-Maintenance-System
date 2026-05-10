import { NextResponse } from "next/server"
import type { Equipment } from "@/lib/types"

// In-memory storage (would be MongoDB in production)
const equipmentStore: Equipment[] = []

export async function GET() {
  return NextResponse.json(equipmentStore)
}

export async function POST(request: Request) {
  const body = await request.json()

  const newEquipment: Equipment = {
    id: `eq-${Date.now()}`,
    name: body.name,
    serialNumber: body.serialNumber,
    purchaseDate: body.purchaseDate,
    warrantyExpiry: body.warrantyExpiry,
    location: body.location,
    department: body.department,
    assignedEmployee: body.assignedEmployee,
    defaultTeamId: body.defaultTeamId,
    defaultTechnicianId: body.defaultTechnicianId,
    isScrap: false,
    failureCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  equipmentStore.push(newEquipment)
  return NextResponse.json(newEquipment, { status: 201 })
}
