import { NextResponse } from "next/server"

const teamsStore: any[] = []

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const team = teamsStore.find((t) => t.id === id)

  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 })
  }

  return NextResponse.json(team)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const index = teamsStore.findIndex((t) => t.id === id)

  if (index === -1) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 })
  }

  teamsStore[index] = {
    ...teamsStore[index],
    ...body,
  }

  return NextResponse.json(teamsStore[index])
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const index = teamsStore.findIndex((t) => t.id === id)

  if (index === -1) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 })
  }

  teamsStore.splice(index, 1)
  return NextResponse.json({ success: true })
}
