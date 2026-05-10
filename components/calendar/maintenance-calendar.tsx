"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/lib/store"
import type { MaintenanceRequest } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Shield, CalendarIcon, Clock } from "lucide-react"

interface MaintenanceCalendarProps {
  onDateClick: (date: string) => void
  onEventClick: (request: MaintenanceRequest) => void
}

export function MaintenanceCalendar({ onDateClick, onEventClick }: MaintenanceCalendarProps) {
  const { requests } = useAppStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week">("month")

  // Only show preventive maintenance in calendar
  const preventiveRequests = requests.filter((r) => r.type === "preventive")

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const getWeekDays = (date: Date) => {
    const days: Date[] = []
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }

    return days
  }

  const getRequestsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return preventiveRequests.filter((r) => r.scheduledDate === dateStr)
  }

  const navigatePrevious = () => {
    const newDate = new Date(currentDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setDate(newDate.getDate() - 7)
    }
    setCurrentDate(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else {
      newDate.setDate(newDate.getDate() + 7)
    }
    setCurrentDate(newDate)
  }

  const days = view === "month" ? getDaysInMonth(currentDate) : getWeekDays(currentDate)

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const formatDateForClick = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  return (
    <div className="space-y-4">
      {/* Calendar header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={navigatePrevious} className="h-8 w-8 bg-transparent">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={navigateNext} className="h-8 w-8 bg-transparent">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={view === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("month")}
            className={view !== "month" ? "bg-transparent" : ""}
          >
            Month
          </Button>
          <Button
            variant={view === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("week")}
            className={view !== "week" ? "bg-transparent" : ""}
          >
            Week
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <Card className="border-border/50 overflow-hidden">
        <CardContent className="p-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {dayNames.map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground bg-muted/30">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className={cn("grid grid-cols-7", view === "week" ? "min-h-[400px]" : "")}>
            <AnimatePresence mode="wait">
              {days.map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-[100px] bg-muted/10 border-b border-r border-border/50"
                    />
                  )
                }

                const dayRequests = getRequestsForDate(date)
                const today = isToday(date)

                return (
                  <motion.div
                    key={date.toISOString()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "min-h-[100px] p-2 border-b border-r border-border/50 cursor-pointer transition-colors hover:bg-muted/30",
                      today && "bg-primary/5",
                      view === "week" && "min-h-[400px]",
                    )}
                    onClick={() => onDateClick(formatDateForClick(date))}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span
                        className={cn(
                          "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                          today && "bg-primary text-primary-foreground",
                        )}
                      >
                        {date.getDate()}
                      </span>
                      {dayRequests.length > 0 && (
                        <Badge variant="secondary" className="text-xs h-5 px-1.5">
                          {dayRequests.length}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayRequests.slice(0, view === "week" ? 10 : 2).map((request) => (
                        <motion.div
                          key={request.id}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={cn(
                            "p-1.5 rounded text-xs cursor-pointer transition-all hover:shadow-md",
                            request.status === "repaired"
                              ? "bg-success/10 text-success border border-success/20"
                              : request.status === "in-progress"
                                ? "bg-warning/10 text-warning border border-warning/20"
                                : "bg-primary/10 text-primary border border-primary/20",
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            onEventClick(request)
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{request.subject}</span>
                          </div>
                        </motion.div>
                      ))}
                      {dayRequests.length > (view === "week" ? 10 : 2) && (
                        <p className="text-xs text-muted-foreground pl-1">
                          +{dayRequests.length - (view === "week" ? 10 : 2)} more
                        </p>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming preventive maintenance */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Upcoming Preventive Maintenance
          </h3>
          <div className="space-y-3">
            {preventiveRequests
              .filter((r) => new Date(r.scheduledDate) >= new Date() && r.status !== "repaired")
              .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
              .slice(0, 5)
              .map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                  onClick={() => onEventClick(request)}
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{request.subject}</p>
                    <p className="text-xs text-muted-foreground truncate">{request.equipmentName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={request.technicianAvatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {request.technicianName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-right">
                      <p className="text-xs font-medium">
                        {new Date(request.scheduledDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {request.duration || "TBD"}h
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            {preventiveRequests.filter((r) => new Date(r.scheduledDate) >= new Date() && r.status !== "repaired")
              .length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming preventive maintenance</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
