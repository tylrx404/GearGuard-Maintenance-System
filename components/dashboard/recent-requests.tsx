"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/lib/store"
import { useAuthStore, canUserPerformAction } from "@/lib/auth-store"
import { cn, extractFirstNameFromEmail } from "@/lib/utils"
import { Clock, AlertTriangle, ArrowRight, User } from "lucide-react"

const statusStyles = {
  new: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  "in-progress": "bg-warning/10 text-warning border-warning/20",
  repaired: "bg-success/10 text-success border-success/20",
  scrap: "bg-destructive/10 text-destructive border-destructive/20",
}

interface RecentRequestsProps {
  userOnly?: boolean
}

export function RecentRequests({ userOnly = false }: RecentRequestsProps) {
  const { requests } = useAppStore()
  const { user } = useAuthStore()

  const canViewAll = canUserPerformAction(user, "view_all_requests")

  // Filter requests based on prop and user role
  const visibleRequests = useMemo(() => {
    if (userOnly || !canViewAll) {
      return requests.filter((r) => r.createdBy === user?.id)
    }
    return requests
  }, [requests, user, canViewAll, userOnly])

  const recentRequests = visibleRequests.slice(0, 5)

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  const getCreatorDisplayName = (request: { createdBy: string; createdByName: string }) => {
    // If this is the current user's request, show their derived name
    if (request.createdBy === user?.id && user?.email) {
      return extractFirstNameFromEmail(user.email)
    }
    // Otherwise use the stored name (which should also be derived from email)
    return request.createdByName
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {userOnly || !canViewAll ? (
            <>
              <User className="h-5 w-5" />
              My Recent Requests
            </>
          ) : (
            "Recent Requests"
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {visibleRequests.filter((r) => r.status === "new").length} new
          </Badge>
          <Link href="/requests">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
              View all
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentRequests.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              {userOnly || !canViewAll ? "You haven't created any requests yet." : "No maintenance requests yet."}
            </p>
            <Link href="/requests">
              <Button variant="outline" className="mt-4 gap-2 bg-transparent">
                Create your first request
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          recentRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors",
                isOverdue(request.dueDate) &&
                  request.status !== "repaired" &&
                  request.status !== "scrap" &&
                  "ring-1 ring-destructive/50",
              )}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={request.technicianAvatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {request.technicianName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{request.subject}</p>
                  {isOverdue(request.dueDate) && request.status !== "repaired" && request.status !== "scrap" && (
                    <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {request.equipmentName} • Created by {getCreatorDisplayName(request)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(request.dueDate).toLocaleDateString()}
                </div>
                <Badge className={cn("capitalize text-xs", statusStyles[request.status])}>
                  {request.status.replace("-", " ")}
                </Badge>
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
