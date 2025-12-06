import type { Class, Student } from "./types"

export const mockClasses: Class[] = [
  {
    id: "1",
    name: "Mathematics 101",
    teacher: "Dr. Sarah Johnson",
    numberOfStudents: 25,
    description: "Introduction to Algebra and Geometry",
  },
  {
    id: "2",
    name: "English Literature",
    teacher: "Prof. Michael Brown",
    numberOfStudents: 30,
    description: "Classic and Modern Literature",
  },
  {
    id: "3",
    name: "Computer Science",
    teacher: "Dr. Emily Chen",
    numberOfStudents: 22,
    description: "Programming Fundamentals",
  },
  {
    id: "4",
    name: "Physics 201",
    teacher: "Dr. James Wilson",
    numberOfStudents: 18,
    description: "Advanced Physics Concepts",
  },
]

export const mockStudents: Student[] = [
  { id: "1", name: "Amina Hassan", className: "Mathematics 101", email: "amina@example.com", status: "Active" },
  { id: "2", name: "Yusuf Ahmed", className: "Mathematics 101", email: "yusuf@example.com", status: "Active" },
  { id: "3", name: "Fatima Ali", className: "English Literature", email: "fatima@example.com", status: "Active" },
  { id: "4", name: "Omar Ibrahim", className: "Computer Science", email: "omar@example.com", status: "Active" },
  { id: "5", name: "Zainab Mohammed", className: "Physics 201", email: "zainab@example.com", status: "Inactive" },
  { id: "6", name: "Ali Hassan", className: "Mathematics 101", email: "ali@example.com", status: "Active" },
  { id: "7", name: "Maryam Osman", className: "English Literature", email: "maryam@example.com", status: "Active" },
  { id: "8", name: "Ibrahim Yusuf", className: "Computer Science", email: "ibrahim@example.com", status: "Active" },
]
