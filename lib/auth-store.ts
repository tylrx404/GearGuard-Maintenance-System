import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User, UserRole } from "./types"
import { extractFirstNameFromEmail } from "./utils"

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "", // Will be derived from email on login
    email: "john@gearguard.com",
    password: "employee123",
    role: "employee",
    department: "Manufacturing",
    avatar: "/professional-male-employee.jpg",
    createdAt: "2024-01-01",
  },
  {
    id: "user-2",
    name: "", // Will be derived from email on login
    email: "sarah@gearguard.com",
    password: "employee123",
    role: "employee",
    department: "IT",
    avatar: "/professional-female-employee.jpg",
    createdAt: "2024-01-01",
  },
  {
    id: "user-3",
    name: "", // Will be derived from email on login
    email: "mike@gearguard.com",
    password: "maintenance123",
    role: "maintenance",
    teamId: "team-2",
    avatar: "/male-technician-worker.jpg",
    createdAt: "2024-01-01",
  },
  {
    id: "user-4",
    name: "", // Will be derived from email on login
    email: "emily@gearguard.com",
    password: "maintenance123",
    role: "maintenance",
    teamId: "team-1",
    avatar: "/female-technician-worker.jpg",
    createdAt: "2024-01-01",
  },
  {
    id: "user-5",
    name: "", // Will be derived from email on login
    email: "alex@gearguard.com",
    password: "maintenance123",
    role: "maintenance",
    teamId: "team-3",
    avatar: "/professional-electrician.png",
    createdAt: "2024-01-01",
  },
]

const dynamicUsers: User[] = []

export function getAllUsers(): User[] {
  return [...mockUsers, ...dynamicUsers]
}

export function addUser(user: User): void {
  dynamicUsers.push(user)
}

export function findUserById(id: string): User | undefined {
  return getAllUsers().find((u) => u.id === id)
}

export function findUserByEmail(email: string): User | undefined {
  return getAllUsers().find((u) => u.email.toLowerCase() === email.toLowerCase())
}

export function getUserDisplayName(email: string): string {
  return extractFirstNameFromEmail(email)
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const allUsers = getAllUsers()
        const user = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)

        if (user) {
          const derivedName = extractFirstNameFromEmail(email)
          const userWithDerivedName: User = {
            ...user,
            name: derivedName,
          }
          set({ user: userWithDerivedName, isAuthenticated: true, isLoading: false, error: null })
          return true
        } else {
          set({ isLoading: false, error: "Invalid email or password" })
          return false
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: "gearguard-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
)

// Helper function to check if user can perform an action
export function canUserPerformAction(
  user: User | null,
  action:
    | "create_request"
    | "view_all_requests"
    | "view_own_requests"
    | "update_request_status"
    | "assign_request"
    | "manage_teams"
    | "manage_equipment"
    | "cancel_request"
    | "add_notes",
): boolean {
  if (!user) return false

  const permissions: Record<UserRole, string[]> = {
    employee: ["create_request", "view_own_requests"],
    maintenance: [
      "create_request",
      "view_all_requests",
      "view_own_requests",
      "update_request_status",
      "assign_request",
      "manage_teams",
      "manage_equipment",
      "cancel_request",
      "add_notes",
    ],
  }

  return permissions[user.role]?.includes(action) ?? false
}
