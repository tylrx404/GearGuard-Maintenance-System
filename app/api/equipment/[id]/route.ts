import { NextResponse } from "next/server"

// Reference to shared store (in production, this would be MongoDB)
const equipmentStore: any[] = []

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const equipment = equipmentStore.find((e) => e.id === id)

  if (!equipment) {
    return NextResponse.json({ error: "Equipment not found" }, { status: 404 })
  }

  return NextResponse.json(equipment)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const index = equipmentStore.findIndex((e) => e.id === id)

  if (index === -1) {
    return NextResponse.json({ error: "Equipment not found" }, { status: 404 })
  }

  equipmentStore[index] = {
    ...equipmentStore[index],
    ...body,
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json(equipmentStore[index])
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const index = equipmentStore.findIndex((e) => e.id === id)

  if (index === -1) {
    return NextResponse.json({ error: "Equipment not found" }, { status: 404 })
  }

  equipmentStore.splice(index, 1)
  return NextResponse.json({ success: true })
}
