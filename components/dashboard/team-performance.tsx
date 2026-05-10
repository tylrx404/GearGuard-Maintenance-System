"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useAppStore } from "@/lib/store"
import { useAuthStore, canUserPerformAction } from "@/lib/auth-store"

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))"]

export function TeamPerformance() {
  const { requests, teams } = useAppStore()
  const { user } = useAuthStore()

  const canViewAll = canUserPerformAction(user, "view_all_requests")

  // Filter requests based on user role
  const visibleRequests = useMemo(() => {
    if (canViewAll) {
      return requests
    }
    return requests.filter((r) => r.createdBy === user?.id)
  }, [requests, user, canViewAll])

  const data = useMemo(() => {
    return teams
      .map((team) => ({
        name: team.name,
        value: visibleRequests.filter((r) => r.teamId === team.id).length,
      }))
      .filter((item) => item.value > 0) // Only show teams with requests
  }, [teams, visibleRequests])

  // If no data, show a message
  if (data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {canViewAll ? "Requests by Team" : "My Requests by Team"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No request data available yet
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {canViewAll ? "Requests by Team" : "My Requests by Team"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
