import { NextResponse } from "next/server"
import type { MaintenanceTeam } from "@/lib/types"

const teamsStore: MaintenanceTeam[] = []

export async function GET() {
  return NextResponse.json(teamsStore)
}

export async function POST(request: Request) {
  const body = await request.json()

  const newTeam: MaintenanceTeam = {
    id: `team-${Date.now()}`,
    name: body.name,
    description: body.description,
    members: body.members || [],
    createdAt: new Date().toISOString(),
  }

  teamsStore.push(newTeam)
  return NextResponse.json(newTeam, { status: 201 })
}
