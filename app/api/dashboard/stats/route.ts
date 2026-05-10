import { NextResponse } from "next/server"

const equipmentStore: any[] = []
const requestsStore: any[] = []
const teamsStore: any[] = []

export async function GET() {
  const activeEquipment = equipmentStore.filter((e) => !e.isScrap).length
  const scrappedEquipment = equipmentStore.filter((e) => e.isScrap).length

  const openRequests = requestsStore.filter((r) => r.status === "new" || r.status === "in-progress").length

  const newRequests = requestsStore.filter((r) => r.status === "new").length

  const overdueRequests = requestsStore.filter(
    (r) => (r.status === "new" || r.status === "in-progress") && new Date(r.dueDate) < new Date(),
  ).length

  const totalTechnicians = teamsStore.reduce((acc, team) => acc + team.members.length, 0)

  const requestsByTeam = teamsStore.map((team) => ({
    teamId: team.id,
    teamName: team.name,
    count: requestsStore.filter((r) => r.teamId === team.id).length,
  }))

  const requestsByStatus = {
    new: requestsStore.filter((r) => r.status === "new").length,
    "in-progress": requestsStore.filter((r) => r.status === "in-progress").length,
    repaired: requestsStore.filter((r) => r.status === "repaired").length,
    scrap: requestsStore.filter((r) => r.status === "scrap").length,
  }

  const repeatFailureEquipment = equipmentStore
    .filter((e) => e.failureCount >= 5)
    .map((e) => ({
      id: e.id,
      name: e.name,
      failureCount: e.failureCount,
    }))

  return NextResponse.json({
    equipment: {
      active: activeEquipment,
      scrapped: scrappedEquipment,
      total: equipmentStore.length,
    },
    requests: {
      open: openRequests,
      new: newRequests,
      overdue: overdueRequests,
      total: requestsStore.length,
      byStatus: requestsByStatus,
      byTeam: requestsByTeam,
    },
    teams: {
      count: teamsStore.length,
      totalTechnicians,
    },
    alerts: {
      overdueRequests,
      repeatFailureEquipment,
    },
  })
}
