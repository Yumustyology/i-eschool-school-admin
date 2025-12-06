export interface Class {
  id: string
  name: string
  teacher: string
  numberOfStudents: number
  description?: string
}

export interface Student {
  id: string
  name: string
  className: string
  email?: string
  status: "Active" | "Inactive"
}

export interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  className: string
  date: string
  status: "Present" | "Absent"
}

export interface AttendanceEntry {
  studentId: string
  studentName: string
  status: "Present" | "Absent"
}

export interface ActivityItem {
  id: string
  action: string
  entityType: string
  entityId?: string
  description?: string
  createdAt: string
}
