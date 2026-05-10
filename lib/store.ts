import { create } from "zustand"
import type { Equipment, MaintenanceTeam, MaintenanceRequest, RequestStatus } from "./types"
import { mockEquipment, mockTeams, mockRequests } from "./mock-data"

interface AppState {
  equipment: Equipment[]
  teams: MaintenanceTeam[]
  requests: MaintenanceRequest[]

  // Equipment actions
  addEquipment: (equipment: Equipment) => void
  updateEquipment: (id: string, equipment: Partial<Equipment>) => void
  deleteEquipment: (id: string) => void

  // Team actions
  addTeam: (team: MaintenanceTeam) => void
  updateTeam: (id: string, team: Partial<MaintenanceTeam>) => void
  deleteTeam: (id: string) => void

  // Request actions
  addRequest: (request: MaintenanceRequest) => void
  updateRequest: (id: string, request: Partial<MaintenanceRequest>) => void
  updateRequestStatus: (id: string, status: RequestStatus) => void
  deleteRequest: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  equipment: mockEquipment,
  teams: mockTeams,
  requests: mockRequests,

  addEquipment: (equipment) => set((state) => ({ equipment: [...state.equipment, equipment] })),

  updateEquipment: (id, updates) =>
    set((state) => ({
      equipment: state.equipment.map((eq) =>
        eq.id === id ? { ...eq, ...updates, updatedAt: new Date().toISOString() } : eq,
      ),
    })),

  deleteEquipment: (id) =>
    set((state) => ({
      equipment: state.equipment.filter((eq) => eq.id !== id),
    })),

  addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),

  updateTeam: (id, updates) =>
    set((state) => ({
      teams: state.teams.map((team) => (team.id === id ? { ...team, ...updates } : team)),
    })),

  deleteTeam: (id) =>
    set((state) => ({
      teams: state.teams.filter((team) => team.id !== id),
    })),

  addRequest: (request) => set((state) => ({ requests: [...state.requests, request] })),

  updateRequest: (id, updates) =>
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === id ? { ...req, ...updates, updatedAt: new Date().toISOString() } : req,
      ),
    })),

  updateRequestStatus: (id, status) =>
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === id ? { ...req, status, updatedAt: new Date().toISOString() } : req,
      ),
    })),

  deleteRequest: (id) =>
    set((state) => ({
      requests: state.requests.filter((req) => req.id !== id),
    })),
}))
