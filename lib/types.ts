export type UserRole = "employee" | "maintenance"

export interface User {
  id: string
  name: string
  email: string
  password: string // In production, this would be hashed
  role: UserRole
  avatar?: string
  department?: string
  teamId?: string // For maintenance users, links to their team
  createdAt: string
}

export interface Equipment {
  id: string
  name: string
  serialNumber: string
  purchaseDate: string
  warrantyExpiry: string
  location: string
  department: string
  assignedEmployee?: string
  defaultTeamId: string
  defaultTechnicianId?: string
  isScrap: boolean
  scrapReason?: string // Added scrap reason field
  failureCount: number
  createdAt: string
  updatedAt: string
}

export interface MaintenanceTeam {
  id: string
  name: string
  description: string
  members: TeamMember[]
  createdAt: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: "lead" | "technician"
  avatar?: string
}

export type RequestType = "corrective" | "preventive"
export type RequestStatus = "new" | "in-progress" | "repaired" | "scrap"

export interface MaintenanceRequest {
  id: string
  subject: string
  description: string
  type: RequestType
  equipmentId: string
  equipmentName: string
  teamId: string
  teamName: string
  technicianId: string
  technicianName: string
  technicianAvatar?: string
  location: string
  scheduledDate: string
  dueDate: string
  duration?: number
  status: RequestStatus
  createdBy: string // Added createdBy field
  createdByName: string // Added createdByName field
  notes?: string // Added notes field for maintenance updates
  createdAt: string
  updatedAt: string
}
