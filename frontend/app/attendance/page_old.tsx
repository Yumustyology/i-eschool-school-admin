"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { AttendanceTableSkeleton } from "@/components/loaders/table-skeleton"
import api from "@/lib/axios.config"
import type { AttendanceEntry, Class, Student } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

const mapApiClass = (data: Record<string, unknown>): Class => ({
  id: String(data._id ?? data.id ?? ""),
  name: String(data.name ?? ""),
  teacher: String(data.teacher ?? ""),
  numberOfStudents: Number(data.numberOfStudents ?? 0),
  description: typeof data.description === "string" ? data.description : "",
})

const mapApiStudent = (data: Record<string, unknown>): Student => ({
  id: String(data._id ?? data.id ?? ""),
  name: String(data.name ?? ""),
  className: String(data.className ?? ""),
  email: typeof data.email === "string" ? data.email : undefined,
  status: (data.status as Student["status"]) || "Active",
})

export default function AttendancePage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [attendance, setAttendance] = useState<AttendanceEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const fetchClasses = useCallback(async () => {
    try {
      const { data } = await api.get("/classes")
      setClasses(Array.isArray(data) ? data.map(mapApiClass) : [])
    } catch (error) {
      toast({
        title: "Failed to load classes",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  const loadAttendance = async () => {
    if (!selectedClass || !selectedDate) return
    setIsLoading(true)

    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        api.get("/students/class", { params: { className: selectedClass } }),
        api.get("/attendance", { params: { className: selectedClass, date: selectedDate } }),
      ])

      const studentsData = Array.isArray(studentsRes.data) ? studentsRes.data.map(mapApiStudent) : []
      const attendanceData = Array.isArray(attendanceRes.data) ? attendanceRes.data : []

      setStudents(studentsData)

      if (attendanceData.length > 0) {
        // Create a map of existing attendance by studentId
        const attendanceMap = new Map<string, string>()
        attendanceData.forEach((record: any) => {
          const studentIdStr = String(record.studentId?._id || record.studentId || "")
          attendanceMap.set(studentIdStr, record.status)
        })

        // Map all students with their attendance status
        const mappedAttendance: AttendanceEntry[] = studentsData.map((student) => {
          const status = attendanceMap.get(student.id) || "Present"
          return {
            studentId: student.id,
            studentName: student.name,
            status: (status as AttendanceEntry["status"]) || "Present",
          }
        })
        setAttendance(mappedAttendance)
      } else {
        const initialEntries: AttendanceEntry[] = studentsData.map((student) => ({
          studentId: student.id,
          studentName: student.name,
          status: "Present",
        }))
        setAttendance(initialEntries)
      }
    } catch (error) {
      toast({
        title: "Failed to load attendance",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAttendance = (studentId: string) => {
    setAttendance((prev) =>
      prev.map((entry) =>
        entry.studentId === studentId ? { ...entry, status: entry.status === "Present" ? "Absent" : "Present" } : entry,
      ),
    )
  }

  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedDate || attendance.length === 0) {
      toast({
        title: "Error",
        description: "Please select a class, date, and load students first",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      await api.post("/attendance", {
        className: selectedClass,
        date: selectedDate,
        records: attendance.map((entry) => ({
          studentId: entry.studentId,
          studentName: entry.studentName,
          status: entry.status,
        })),
      })

      const presentCount = attendance.filter((a) => a.status === "Present").length
      const totalCount = attendance.length
      const percentage = Math.round((presentCount / totalCount) * 100)

      toast({
        title: "Attendance Saved",
        description: `${presentCount} of ${totalCount} students present (${percentage}%)`,
      })
    } catch (error) {
      toast({
        title: "Failed to save attendance",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Attendance</h2>
        <p className="mt-2 text-muted-foreground">Mark student attendance for classes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Class and Date</CardTitle>
          <CardDescription>Choose a class and date to mark attendance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="class-select">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger id="class-select">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.name}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-select">Date</Label>
              <input
                id="date-select"
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={loadAttendance} disabled={!selectedClass || isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Load Students
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {attendance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
            <CardDescription>Click on status to toggle between Present and Absent</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <AttendanceTableSkeleton />
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((entry) => (
                    <TableRow key={entry.studentId}>
                      <TableCell className="font-medium">{entry.studentName}</TableCell>
                      <TableCell>
                        <Button
                          variant={entry.status === "Present" ? "default" : "destructive"}
                          size="sm"
                          onClick={() => toggleAttendance(entry.studentId)}
                        >
                          {entry.status}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveAttendance} size="lg" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Attendance
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
