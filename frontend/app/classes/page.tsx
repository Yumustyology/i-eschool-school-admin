"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useClasses, createClass, updateClass, deleteClass } from "@/hooks/useApi"
import { ClassesTableSkeleton } from "@/components/loaders/table-skeleton"
import type { Class } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { classSchema, type ClassFormData } from "@/lib/validation"

export default function ClassesPage() {
  const { classes, isLoading, mutate } = useClasses()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: "",
      teacher: "",
      description: "",
    },
  })

  const onSubmit = async (data: ClassFormData) => {
    setIsSaving(true)
    
    if (editingClass) {
      // Update existing class
      const result = await updateClass(editingClass.id, data)
      if (result.success) {
        reset()
        setEditingClass(null)
        setIsDialogOpen(false)
        await mutate()
        toast({ title: "Success", description: "Class updated successfully" })
      } else {
        toast({
          title: "Failed to update class",
          description: result.error,
          variant: "destructive",
        })
      }
    } else {
      // Create new class
      const result = await createClass(data)
      if (result.success) {
        reset()
        setIsDialogOpen(false)
        await mutate()
        toast({ title: "Success", description: "Class added successfully" })
      } else {
        toast({
          title: "Failed to add class",
          description: result.error,
          variant: "destructive",
        })
      }
    }
    
    setIsSaving(false)
  }

  const handleEditClass = (classItem: Class) => {
    setEditingClass(classItem)
    reset({
      name: classItem.name,
      teacher: classItem.teacher,
      description: classItem.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingClass(null)
    reset()
  }

  const handleDeleteClass = async (id: string) => {
    const result = await deleteClass(id)
    if (result.success) {
      await mutate()
      toast({ title: "Success", description: "Class deleted successfully" })
    } else {
      toast({
        title: "Failed to delete class",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Classes</h2>
          <p className="mt-2 text-muted-foreground">Manage all classes and courses</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClass ? "Edit Class" : "Add New Class"}</DialogTitle>
              <DialogDescription>
                {editingClass ? "Update class information" : "Create a new class with teacher and description"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Class Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Mathematics 101"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher">Teacher Name *</Label>
                  <Input
                    id="teacher"
                    placeholder="e.g., Dr. Sarah Johnson"
                    {...register("teacher")}
                  />
                  {errors.teacher && (
                    <p className="text-sm text-destructive">{errors.teacher.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the class"
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingClass ? "Update Class" : "Add Class"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
          <CardDescription>A list of all classes with their details</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <ClassesTableSkeleton />
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>No. of Students</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classItem: Class) => (
                  <TableRow key={classItem.id}>
                    <TableCell className="font-medium">{classItem.name}</TableCell>
                    <TableCell>{classItem.teacher}</TableCell>
                    <TableCell>{classItem.numberOfStudents}</TableCell>
                    <TableCell className="max-w-xs truncate">{classItem.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClass(classItem)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClass(classItem.id)}>
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
