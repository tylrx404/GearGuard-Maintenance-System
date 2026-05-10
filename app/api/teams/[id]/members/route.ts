import { NextResponse } from "next/server"
import type { TeamMember } from "@/lib/types"

const teamsStore: any[] = []

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const index = teamsStore.findIndex((t) => t.id === id)

  if (index === -1) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 })
  }

  const newMember: TeamMember = {
    id: `tech-${Date.now()}`,
    name: body.name,
    email: body.email,
    role: body.role || "technician",
    avatar: body.avatar,
  }

  teamsStore[index].members.push(newMember)
  return NextResponse.json(newMember, { status: 201 })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { searchParams } = new URL(request.url)
  const memberId = searchParams.get("memberId")

  const index = teamsStore.findIndex((t) => t.id === id)

  if (index === -1) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 })
  }

  teamsStore[index].members = teamsStore[index].members.filter((m: TeamMember) => m.id !== memberId)
  return NextResponse.json({ success: true })
}
