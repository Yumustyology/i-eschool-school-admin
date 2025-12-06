"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Users, ClipboardCheck, TrendingUp, AlertTriangle, Clock } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { useClasses, useStudents, useAttendance, useActivities } from "@/hooks/useApi"
import type { AttendanceRecord } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DashboardPage() {
  const router = useRouter()
  const { classes, isLoading: classesLoading } = useClasses()
  const { students, isLoading: studentsLoading } = useStudents()
  const today = new Date().toISOString().split("T")[0]
  const { attendance, isLoading: attendanceLoading } = useAttendance(undefined, today)
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false)
  const { activities, isLoading: activitiesLoading } = useActivities(5)
  const { activities: allActivities, isLoading: allActivitiesLoading } = useActivities(200, 1, activityDrawerOpen)

  const formatTimeAgo = (dateString: string) => {
    const now = Date.now()
    const then = new Date(dateString).getTime()
    const diffMs = Math.max(0, now - then)
    const minutes = Math.floor(diffMs / (1000 * 60))
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`
    const weeks = Math.floor(days / 7)
    return `${weeks} wk${weeks === 1 ? "" : "s"} ago`
  }

  const quickActions = useMemo(
    () => [
      {
        title: "Mark Today's Attendance",
        description: "Record student attendance for all classes",
        action: () => router.push("/attendance"),
      },
      {
        title: "Generate AI Summary",
        description: "Get AI-powered insights on attendance",
        action: () => router.push("/ai-summary"),
      },
      {
        title: "Send Teams Message",
        description: "Notify staff via Microsoft Teams",
        action: () => router.push("/teams-integration"),
      },
    ],
    [router],
  )

  const totalStudents = students.length
  const totalClasses = classes.length
  const activeStudents = students.filter(s => s.status === "Active").length
  
  const presentToday = attendance.filter((a: AttendanceRecord) => a.status === "Present").length
  const totalAttendanceRecords = attendance.length
  const attendancePercentage = totalAttendanceRecords > 0 
    ? Math.round((presentToday / totalAttendanceRecords) * 100) 
    : 0

  const isLoading = classesLoading || studentsLoading || attendanceLoading
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <p className="mt-2 text-muted-foreground">Welcome to the i-eSchool Admin Panel</p>
      </div>

      {/* Developer Notes */}
      <Alert className="border-primary/50 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <strong className="font-semibold text-foreground">Developer Notes:</strong>
          <span className="text-muted-foreground">
            {" "}
            This frontend is for an interview exercise. Candidates should complete a minimum of{" "}
            <strong>1 of the following 3 tasks:</strong>
          </span>
          <ul className="mt-2 ml-4 list-disc space-y-1 text-muted-foreground">
            <li>Replace mock data with a real database (PostgreSQL, MongoDB, etc.)</li>
            <li>Implement a Microsoft Teams webhook endpoint to send messages from the Teams Integration page</li>
            <li>Build real APIs for classes, students, and attendance (REST or GraphQL)</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <Card>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </CardHeader>
            </Card>
          </>
        ) : (
          <>
            <StatCard 
              title="Total Students" 
              value={totalStudents} 
              icon={Users} 
              description={`${activeStudents} active students`} 
            />
            <StatCard 
              title="Total Classes" 
              value={totalClasses} 
              icon={BookOpen} 
              description="Ongoing courses" 
            />
            <StatCard 
              title="Today's Attendance" 
              value={totalAttendanceRecords > 0 ? `${attendancePercentage}%` : "N/A"} 
              icon={ClipboardCheck} 
              description={totalAttendanceRecords > 0 ? `${presentToday} of ${totalAttendanceRecords} present` : "No records today"} 
            />
            <StatCard 
              title="Avg. Performance" 
              value={attendancePercentage > 0 ? `${attendancePercentage}%` : "N/A"} 
              icon={TrendingUp} 
              description="Based on attendance" 
            />
          </>
        )}
      </div>

      {/* Quick Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <Drawer direction="right" open={activityDrawerOpen} onOpenChange={setActivityDrawerOpen}>
            <CardHeader className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from the system</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="sm">View all</Button>
                </DrawerTrigger>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activitiesLoading ? (
                  [1, 2, 3].map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <Skeleton className="mt-1 h-2 w-2 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-56" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))
                ) : activities.length === 0 ? (
                  <div className="flex items-start gap-3 rounded-lg border border-dashed p-3 text-sm">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">No activity yet</p>
                      <p className="text-muted-foreground">Actions you take will show up here once recorded.</p>
                    </div>
                  </div>
                ) : (
                  activities.map(item => (
                    <div key={item.id} className="flex items-start gap-3 text-sm">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{item.action}</p>
                        {item.description && <p className="text-muted-foreground">{item.description}</p>}
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(item.createdAt)}</span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>All Activity</DrawerTitle>
                <DrawerDescription>All recorded activity</DrawerDescription>
              </DrawerHeader>
              <div className="px-4 pb-4">
                {allActivitiesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(item => (
                      <div key={item} className="flex items-start gap-3">
                        <Skeleton className="mt-1 h-2 w-2 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-64" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : allActivities.length === 0 ? (
                  <div className="flex items-start gap-3 rounded-lg border border-dashed p-4 text-sm">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">No activity yet</p>
                      <p className="text-muted-foreground">Perform an action like creating a class or marking attendance to see it logged.</p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4">
                      {allActivities.map(item => (
                        <div key={item.id} className="flex items-start gap-3 text-sm">
                          <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{item.action}</p>
                            {item.description && <p className="text-muted-foreground">{item.description}</p>}
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimeAgo(item.createdAt)}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
              <DrawerClose className="px-4 pb-4">
                <Button variant="outline" className="w-full">Close</Button>
              </DrawerClose>
            </DrawerContent>
          </Drawer>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map(action => (
                <button
                  key={action.title}
                  type="button"
                  onClick={action.action}
                  className="w-full rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent/50"
                >
                  <p className="font-medium text-foreground">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
