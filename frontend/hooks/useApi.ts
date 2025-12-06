import useSWR from 'swr';
import axiosConfig from "@/lib/axios.config"
import type { ActivityItem, AttendanceRecord, Class, Student } from "@/lib/types"

const fetcher = <T>(url: string) => axiosConfig.get<T>(url).then((res) => res.data)

const mapApiActivity = (data: unknown): ActivityItem => {
  const record = data as Partial<ActivityItem> & { _id?: string; createdAt?: string | Date }
  return {
    id: String(record._id || record.id || ""),
    action: String(record.action || ""),
    entityType: String(record.entityType || ""),
    entityId: record.entityId ? String(record.entityId) : undefined,
    description: record.description ? String(record.description) : undefined,
    createdAt: record.createdAt ? String(record.createdAt) : new Date().toISOString(),
  }
}

const mapApiClass = (data: unknown): Class => {
  const record = data as Partial<Class> & { _id?: string }
  return {
    id: String(record._id || record.id || ""),
    name: String(record.name || ""),
    teacher: String(record.teacher || ""),
    numberOfStudents: Number(record.numberOfStudents || 0),
    description: typeof record.description === "string" ? record.description : "",
  }
}

const mapApiStudent = (data: unknown): Student => {
  const record = data as Partial<Student> & { _id?: string }
  return {
    id: String(record._id || record.id || ""),
    name: String(record.name || ""),
    className: String(record.className || ""),
    email: typeof record.email === "string" ? record.email : undefined,
    status: (record.status as "Active" | "Inactive") || "Active",
  }
}

export const useClasses = () => {
  const { data, error, isLoading, mutate } = useSWR<Class[]>("/classes", fetcher)
  const mappedClasses: Class[] = data ? data.map(mapApiClass) : []
  return { classes: mappedClasses, error, isLoading, mutate }
}

export const useStudents = (className?: string) => {
  const url = className ? `/students/class?className=${className}` : "/students"
  const { data, error, isLoading, mutate } = useSWR<Student[]>(url, fetcher, {
    dedupingInterval: 5000,
  })
  const mappedStudents: Student[] = data ? data.map(mapApiStudent) : []
  return { students: mappedStudents, error, isLoading, mutate }
}

export const useAttendance = (className?: string, date?: string) => {
  const params = new URLSearchParams()
  if (className) params.append("className", className)
  if (date) params.append("date", date)

  const url = params.toString() ? `/attendance?${params.toString()}` : "/attendance"
  const { data, error, isLoading, mutate } = useSWR<AttendanceRecord[]>(url, fetcher)
  return { attendance: data ?? [], error, isLoading, mutate }
}

export const useActivities = (limit = 5, page = 1, enabled = true) => {
  const params = new URLSearchParams({ limit: String(limit), page: String(page) })
  const key = enabled ? `/activity?${params.toString()}` : null
  const { data, error, isLoading, mutate } = useSWR<{ items: ActivityItem[]; total: number; page: number; limit: number }>(key, fetcher)
  const mappedActivities: ActivityItem[] = data?.items ? data.items.map(mapApiActivity) : []
  return {
    activities: mappedActivities,
    total: data?.total || 0,
    page: data?.page || page,
    limit: data?.limit || limit,
    error,
    isLoading,
    mutate,
  }
}

export const createClass = async (classData: { name: string; teacher: string; description?: string }) => {
  try {
    const { data } = await axiosConfig.post("/classes", classData)
    return { success: true, data: mapApiClass(data) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create class" }
  }
}

export const updateClass = async (id: string, classData: { name: string; teacher: string; description?: string }) => {
  try {
    const { data } = await axiosConfig.put(`/classes/${id}`, classData)
    return { success: true, data: mapApiClass(data) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update class" }
  }
}

export const deleteClass = async (id: string) => {
  try {
    await axiosConfig.delete(`/classes/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete class" }
  }
}

export const createStudent = async (studentData: { name: string; className: string; email?: string }) => {
  try {
    const { data } = await axiosConfig.post("/students", studentData)
    return { success: true, data: mapApiStudent(data) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create student" }
  }
}

export const updateStudent = async (id: string, studentData: { name: string; className: string; email?: string; status?: "Active" | "Inactive" }) => {
  try {
    const { data } = await axiosConfig.put(`/students/${id}`, studentData)
    return { success: true, data: mapApiStudent(data) }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update student" }
  }
}

export const deleteStudent = async (id: string) => {
  try {
    await axiosConfig.delete(`/students/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete student" }
  }
}

export const saveAttendance = async (attendanceData: {
  className: string
  date: string
  records: Array<{ studentId: string; studentName: string; status: "Present" | "Absent" }>
}) => {
  try {
    const { data } = await axiosConfig.post("/attendance", attendanceData)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to save attendance" }
  }
}

export const sendTeamsMessage = async (webhookUrl: string, message: string) => {
  try {
    const { data } = await axiosConfig.post("/teams/send-message", { webhookUrl, message })
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to send message" }
  }
}
