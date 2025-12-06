"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { StudentsTableSkeleton } from "@/components/loaders/table-skeleton"
import api from "@/lib/axios.config"
import type { Class, Student } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

const mapApiStudent = (data: Record<string, unknown>): Student => ({
  id: String(data._id ?? data.id ?? ""),
  name: String(data.name ?? ""),
  className: String(data.className ?? ""),
  email: typeof data.email === "string" ? data.email : undefined,
  status: (data.status as Student["status"]) || "Active",
})

const mapApiClass = (data: Record<string, unknown>): Class => ({
  id: String(data._id ?? data.id ?? ""),
  name: String(data.name ?? ""),
  teacher: String(data.teacher ?? ""),
  numberOfStudents: Number(data.numberOfStudents ?? 0),
  description: typeof data.description === "string" ? data.description : "",
})

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [newStudent, setNewStudent] = useState({ name: "", className: "", email: "" })
  const { toast } = useToast()

  const fetchStudents = useCallback(async () => {
    setIsLoading(true)
    try {
      const [{ data: studentsData }, { data: classesData }] = await Promise.all([
        api.get("/students"),
        api.get("/classes"),
      ])

      const mappedStudents = Array.isArray(studentsData) ? studentsData.map(mapApiStudent) : []
      const mappedClasses = Array.isArray(classesData) ? classesData.map(mapApiClass) : []

      setStudents(mappedStudents)
      setClasses(mappedClasses)
    } catch (error) {
      toast({
        title: "Failed to load data",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.className) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      if (editingStudent) {
        // Update existing student
        const { data } = await api.put(`/students/${editingStudent.id}`, { ...newStudent, status: editingStudent.status })
        setStudents((prev) => prev.map((s) => (s.id === editingStudent.id ? mapApiStudent(data) : s)))
        toast({ title: "Success", description: "Student updated successfully" })
      } else {
        // Create new student
        const { data } = await api.post("/students", { ...newStudent, status: "Active" })
        setStudents((prev) => [...prev, mapApiStudent(data)])
        toast({ title: "Success", description: "Student added successfully" })
      }
      setNewStudent({ name: "", className: "", email: "" })
      setEditingStudent(null)
      setIsDialogOpen(false)
    } catch (error) {
      toast({
        title: editingStudent ? "Failed to update student" : "Failed to add student",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setNewStudent({
      name: student.name,
      className: student.className,
      email: student.email || "",
    })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingStudent(null)
    setNewStudent({ name: "", className: "", email: "" })
  }

  const handleDeleteStudent = async (id: string) => {
    try {
      await api.delete(`/students/${id}`)
      setStudents((prev) => prev.filter((s) => s.id !== id))
      toast({ title: "Success", description: "Student deleted successfully" })
    } catch (error) {
      toast({
        title: "Failed to delete student",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Students</h2>
          <p className="mt-2 text-muted-foreground">Manage all enrolled students</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
              <DialogDescription>
                {editingStudent ? "Update student information" : "Enroll a new student in a class"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="student-name">Student Name *</Label>
                <Input
                  id="student-name"
                  placeholder="e.g., John Doe"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
                <Select
                  value={newStudent.className}
                  onValueChange={(value) => setNewStudent({ ...newStudent, className: value })}
                >
                  <SelectTrigger id="class">
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
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleAddStudent} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingStudent ? "Update Student" : "Add Student"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>A list of all enrolled students</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <StudentsTableSkeleton />
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.className}</TableCell>
                    <TableCell>{student.email || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === "Active" ? "default" : "secondary"}>{student.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditStudent(student)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(student.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
