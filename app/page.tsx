"use client"

import { useMemo } from "react"
import { AppShell } from "@/components/app-shell"
import { StatCard } from "@/components/stat-card"
import { RequestChart } from "@/components/dashboard/request-chart"
import { TeamPerformance } from "@/components/dashboard/team-performance"
import { RecentRequests } from "@/components/dashboard/recent-requests"
import { useAppStore } from "@/lib/store"
import { useAuthStore, canUserPerformAction } from "@/lib/auth-store"
import { extractFirstNameFromEmail } from "@/lib/utils"
import { Wrench, ClipboardList, Users, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export default function DashboardPage() {
  const { equipment, requests, teams } = useAppStore()
  const { user } = useAuthStore()

  const canViewAll = canUserPerformAction(user, "view_all_requests")

  const displayName = user?.email ? extractFirstNameFromEmail(user.email) : "User"

  // Get requests based on user role
  const visibleRequests = useMemo(() => {
    if (canViewAll) {
      return requests
    }
    return requests.filter((r) => r.createdBy === user?.id)
  }, [requests, user, canViewAll])

  const openRequests = visibleRequests.filter((r) => r.status === "new" || r.status === "in-progress").length

  const overdueRequests = visibleRequests.filter(
    (r) => (r.status === "new" || r.status === "in-progress") && new Date(r.dueDate) < new Date(),
  ).length

  const completedRequests = visibleRequests.filter((r) => r.status === "repaired").length

  // Different dashboard views based on role
  if (!canViewAll) {
    // Employee dashboard - focused on their requests
    return (
      <AppShell title="My Dashboard" subtitle={`Welcome back, ${displayName}`}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="My Requests"
              value={visibleRequests.length}
              change="Total submitted"
              changeType="neutral"
              icon={ClipboardList}
              iconColor="bg-chart-1/10 text-chart-1"
              delay={0}
            />
            <StatCard
              title="In Progress"
              value={visibleRequests.filter((r) => r.status === "in-progress").length}
              change="Being worked on"
              changeType="neutral"
              icon={Clock}
              iconColor="bg-warning/10 text-warning"
              delay={0.1}
            />
            <StatCard
              title="Completed"
              value={completedRequests}
              change="Successfully repaired"
              changeType="positive"
              icon={CheckCircle}
              iconColor="bg-success/10 text-success"
              delay={0.2}
            />
            <StatCard
              title="Pending"
              value={visibleRequests.filter((r) => r.status === "new").length}
              change="Awaiting assignment"
              changeType="neutral"
              icon={AlertTriangle}
              iconColor="bg-chart-2/10 text-chart-2"
              delay={0.3}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RequestChart />
            <TeamPerformance />
          </div>

          <RecentRequests userOnly />
        </div>
      </AppShell>
    )
  }

  // Maintenance dashboard - full overview
  return (
    <AppShell title="Dashboard" subtitle={`Welcome back, ${displayName}. Overview of your maintenance operations.`}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Equipment"
            value={equipment.filter((e) => !e.isScrap).length}
            change={`${equipment.filter((e) => e.isScrap).length} scrapped`}
            changeType="neutral"
            icon={Wrench}
            iconColor="bg-chart-1/10 text-chart-1"
            delay={0}
          />
          <StatCard
            title="Open Requests"
            value={openRequests}
            change={`${requests.filter((r) => r.status === "new").length} new`}
            changeType="neutral"
            icon={ClipboardList}
            iconColor="bg-chart-2/10 text-chart-2"
            delay={0.1}
          />
          <StatCard
            title="Active Teams"
            value={teams.length}
            change={`${teams.reduce((acc, t) => acc + t.members.length, 0)} technicians`}
            changeType="positive"
            icon={Users}
            iconColor="bg-chart-3/10 text-chart-3"
            delay={0.2}
          />
          <StatCard
            title="Overdue"
            value={overdueRequests}
            change={overdueRequests > 0 ? "Needs attention" : "All on track"}
            changeType={overdueRequests > 0 ? "negative" : "positive"}
            icon={AlertTriangle}
            iconColor={overdueRequests > 0 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}
            delay={0.3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RequestChart />
          <TeamPerformance />
        </div>

        <RecentRequests />
      </div>
    </AppShell>
  )
}
