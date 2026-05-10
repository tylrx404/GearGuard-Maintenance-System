"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useAppStore } from "@/lib/store"
import { useAuthStore, canUserPerformAction } from "@/lib/auth-store"

export function RequestChart() {
  const { requests } = useAppStore()
  const { user } = useAuthStore()

  const canViewAll = canUserPerformAction(user, "view_all_requests")

  // Filter requests based on user role
  const visibleRequests = useMemo(() => {
    if (canViewAll) {
      return requests
    }
    return requests.filter((r) => r.createdBy === user?.id)
  }, [requests, user, canViewAll])

  // Generate dynamic weekly data from actual requests
  const data = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const today = new Date()
    const weekData = days.map((name, index) => ({
      name,
      corrective: 0,
      preventive: 0,
    }))

    visibleRequests.forEach((request) => {
      const createdDate = new Date(request.createdAt)
      const dayOfWeek = createdDate.getDay()

      // Count requests created in the last 7 days
      const diffTime = Math.abs(today.getTime() - createdDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays <= 30) {
        // Show data from last 30 days aggregated by day of week
        if (request.type === "corrective") {
          weekData[dayOfWeek].corrective++
        } else if (request.type === "preventive") {
          weekData[dayOfWeek].preventive++
        }
      }
    })

    // Reorder to start from Monday
    return [...weekData.slice(1), weekData[0]]
  }, [visibleRequests])

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {canViewAll ? "Weekly Request Volume" : "My Request History"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs fill-muted-foreground" />
              <YAxis className="text-xs fill-muted-foreground" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="corrective" name="Corrective" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="preventive" name="Preventive" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
