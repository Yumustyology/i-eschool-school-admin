# Backend Implementation Tasks

This document outlines the specific backend tasks candidates need to implement during the technical interview.

## Task Options

**Complete at least 1 of the following 3 tasks:**

---

## Task 1: Database Integration

### Objective
Replace the frontend mock data with a real database backend.

### Requirements

#### 1. Database Setup
- Choose a database: PostgreSQL, MongoDB, MySQL, or Supabase
- Create tables/collections for: `classes`, `students`, `attendance`
- Implement proper relationships/foreign keys

#### 2. Database Schema

**PostgreSQL/MySQL Example:**
\`\`\`sql
CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  teacher VARCHAR(255) NOT NULL,
  number_of_students INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  class_name VARCHAR(255),
  email VARCHAR(255),
  status VARCHAR(50) CHECK (status IN ('Active', 'Inactive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  student_name VARCHAR(255),
  class_name VARCHAR(255),
  date DATE NOT NULL,
  status VARCHAR(50) CHECK (status IN ('Present', 'Absent')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, date)
);
\`\`\`

**MongoDB Example:**
\`\`\`javascript
// classes collection
{
  _id: ObjectId,
  name: String,
  teacher: String,
  numberOfStudents: Number,
  description: String,
  createdAt: Date,
  updatedAt: Date
}

// students collection
{
  _id: ObjectId,
  name: String,
  className: String,
  email: String,
  status: String, // 'Active' or 'Inactive'
  createdAt: Date,
  updatedAt: Date
}

// attendance collection
{
  _id: ObjectId,
  studentId: ObjectId,
  studentName: String,
  className: String,
  date: Date,
  status: String, // 'Present' or 'Absent'
  createdAt: Date
}
\`\`\`

#### 3. API Endpoints to Implement

**Classes API:**
\`\`\`
GET    /api/classes          # Get all classes
POST   /api/classes          # Create a new class
DELETE /api/classes/[id]     # Delete a class
\`\`\`

**Students API:**
\`\`\`
GET    /api/students         # Get all students
POST   /api/students         # Create a new student
DELETE /api/students/[id]    # Delete a student
\`\`\`

**Attendance API:**
\`\`\`
GET    /api/attendance?classId=&date=  # Get attendance records
POST   /api/attendance                  # Save attendance
\`\`\`

#### 4. Files to Create/Modify

**Create:**
- `lib/db.ts` - Database connection
- `app/api/classes/route.ts` - Classes API
- `app/api/classes/[id]/route.ts` - Delete class API
- `app/api/students/route.ts` - Students API
- `app/api/students/[id]/route.ts` - Delete student API
- `app/api/attendance/route.ts` - Attendance API

**Modify:**
- `app/classes/page.tsx` - Use API instead of local state
- `app/students/page.tsx` - Use API instead of local state
- `app/attendance/page.tsx` - Use API instead of local state

#### 5. Example Implementation

\`\`\`typescript
// lib/db.ts - PostgreSQL with Neon or Supabase
import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL!)

// app/api/classes/route.ts
import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const classes = await sql`SELECT * FROM classes ORDER BY created_at DESC`
    return NextResponse.json(classes)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, teacher, description } = body

    const result = await sql`
      INSERT INTO classes (name, teacher, number_of_students, description)
      VALUES (${name}, ${teacher}, 0, ${description})
      RETURNING *
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  }
}
\`\`\`

#### 6. Evaluation Criteria
- ✅ Database properly connected
- ✅ All API endpoints working
- ✅ Data persists across page refreshes
- ✅ Error handling implemented
- ✅ TypeScript types maintained
- ✅ UI successfully makes API calls

---

## Task 2: Microsoft Teams Integration

### Objective
Implement a backend endpoint that sends messages to Microsoft Teams using webhook URLs.

### Requirements

#### 1. Create Teams Webhook Endpoint

**File to create:**
- `app/api/teams/send-message/route.ts`

#### 2. Implementation Details

The endpoint should:
- Accept POST requests with `webhookUrl` and `message`
- Validate the webhook URL format
- Send the message to Microsoft Teams
- Return success/error responses
- Handle network errors gracefully

#### 3. Example Implementation

\`\`\`typescript
// app/api/teams/send-message/route.ts
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { webhookUrl, message } = await request.json()

    // Validate inputs
    if (!webhookUrl || !message) {
      return NextResponse.json(
        { error: "Webhook URL and message are required" },
        { status: 400 }
      )
    }

    // Validate webhook URL format
    if (!webhookUrl.includes("webhook.office.com")) {
      return NextResponse.json(
        { error: "Invalid Microsoft Teams webhook URL" },
        { status: 400 }
      )
    }

    // Prepare Teams message card (adaptive card or simple text)
    const teamsMessage = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      "summary": "i-eSchool Notification",
      "themeColor": "6264A7",
      "title": "i-eSchool Admin Panel",
      "sections": [
        {
          "activityTitle": "New Message",
          "activitySubtitle": new Date().toLocaleString(),
          "text": message,
        },
      ],
    }

    // Send to Teams
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(teamsMessage),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Teams API error:", errorText)
      throw new Error("Failed to send message to Teams")
    }

    return NextResponse.json({
      success: true,
      message: "Message sent to Microsoft Teams successfully",
    })
  } catch (error) {
    console.error("Error sending to Teams:", error)
    return NextResponse.json(
      {
        error: "Failed to send message to Teams",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
\`\`\`

#### 4. Update Frontend

**Modify:** `app/teams-integration/page.tsx`

Replace the placeholder function with real API call:

\`\`\`typescript
// Find this function in app/teams-integration/page.tsx
const handleSendMessage = async () => {
  setIsLoading(true)
  setError(null)
  setSuccess(null)

  try {
    const response = await fetch("/api/teams/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        webhookUrl,
        message,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to send message")
    }

    setSuccess("Message sent to Microsoft Teams successfully!")
    setMessage("") // Clear message
  } catch (err) {
    setError(err instanceof Error ? err.message : "An error occurred")
  } finally {
    setIsLoading(false)
  }
}
\`\`\`

#### 5. Testing

**Get a Teams Webhook URL:**
1. Open Microsoft Teams
2. Go to a channel
3. Click "..." → "Connectors" → "Incoming Webhook"
4. Create a new webhook and copy the URL

**Test your implementation:**
1. Paste the webhook URL in the Teams Integration page
2. Enter a message
3. Click "Send Test Message"
4. Check your Teams channel for the message

#### 6. Evaluation Criteria
- ✅ API endpoint created and working
- ✅ Webhook URL validation implemented
- ✅ Messages successfully sent to Teams
- ✅ Error handling for failed requests
- ✅ Frontend updated to call the API
- ✅ Success/error states displayed to user

---

## Task 3: REST API Implementation

### Objective
Build a complete REST API layer for all features (classes, students, attendance).

### Requirements

#### 1. API Endpoints Overview

All endpoints should follow REST conventions:

\`\`\`
# Classes
GET    /api/classes           # List all classes
POST   /api/classes           # Create class
GET    /api/classes/[id]      # Get single class (optional)
PUT    /api/classes/[id]      # Update class (optional)
DELETE /api/classes/[id]      # Delete class

# Students
GET    /api/students          # List all students
POST   /api/students          # Create student
GET    /api/students/[id]     # Get single student (optional)
PUT    /api/students/[id]     # Update student (optional)
DELETE /api/students/[id]     # Delete student

# Attendance
GET    /api/attendance        # List attendance (with filters)
POST   /api/attendance        # Save attendance
\`\`\`

#### 2. Request/Response Format

**Create Class (POST /api/classes):**
\`\`\`json
// Request
{
  "name": "Biology 101",
  "teacher": "Dr. Smith",
  "description": "Introduction to Biology"
}

// Response (201 Created)
{
  "id": "123",
  "name": "Biology 101",
  "teacher": "Dr. Smith",
  "numberOfStudents": 0,
  "description": "Introduction to Biology"
}
\`\`\`

**Get Classes (GET /api/classes):**
\`\`\`json
// Response (200 OK)
[
  {
    "id": "1",
    "name": "Biology 101",
    "teacher": "Dr. Smith",
    "numberOfStudents": 25,
    "description": "Introduction to Biology"
  },
  ...
]
\`\`\`

**Save Attendance (POST /api/attendance):**
\`\`\`json
// Request
{
  "className": "Biology 101",
  "date": "2025-12-03",
  "records": [
    { "studentId": "1", "studentName": "John Doe", "status": "Present" },
    { "studentId": "2", "studentName": "Jane Smith", "status": "Absent" }
  ]
}

// Response (201 Created)
{
  "success": true,
  "message": "Attendance saved successfully",
  "recordCount": 2
}
\`\`\`

#### 3. Implementation with In-Memory Storage

If you don't have time for a database, use in-memory storage:

\`\`\`typescript
// lib/storage.ts
import type { Class, Student, AttendanceRecord } from "./types"

// In-memory data stores
let classes: Class[] = []
let students: Student[] = []
let attendance: AttendanceRecord[] = []

export const storage = {
  // Classes
  getAllClasses: () => classes,
  getClassById: (id: string) => classes.find((c) => c.id === id),
  createClass: (classData: Omit<Class, "id">) => {
    const newClass = { ...classData, id: Date.now().toString() }
    classes.push(newClass)
    return newClass
  },
  deleteClass: (id: string) => {
    classes = classes.filter((c) => c.id !== id)
  },

  // Students
  getAllStudents: () => students,
  getStudentById: (id: string) => students.find((s) => s.id === id),
  createStudent: (studentData: Omit<Student, "id">) => {
    const newStudent = { ...studentData, id: Date.now().toString() }
    students.push(newStudent)
    return newStudent
  },
  deleteStudent: (id: string) => {
    students = students.filter((s) => s.id !== id)
  },

  // Attendance
  getAttendance: (filters?: { className?: string; date?: string }) => {
    let results = attendance
    if (filters?.className) {
      results = results.filter((a) => a.className === filters.className)
    }
    if (filters?.date) {
      results = results.filter((a) => a.date === filters.date)
    }
    return results
  },
  saveAttendance: (records: Omit<AttendanceRecord, "id">[]) => {
    const newRecords = records.map((r) => ({
      ...r,
      id: Date.now().toString() + Math.random(),
    }))
    attendance.push(...newRecords)
    return newRecords
  },
}
\`\`\`

#### 4. Example API Route

\`\`\`typescript
// app/api/classes/route.ts
import { NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET() {
  try {
    const classes = storage.getAllClasses()
    return NextResponse.json(classes)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    if (!body.name || !body.teacher) {
      return NextResponse.json(
        { error: "Name and teacher are required" },
        { status: 400 }
      )
    }

    const newClass = storage.createClass({
      name: body.name,
      teacher: body.teacher,
      numberOfStudents: 0,
      description: body.description || "",
    })

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    )
  }
}
\`\`\`

#### 5. Update All Frontend Pages

Modify the frontend to use the APIs instead of local state.

**Example for Classes page:**
\`\`\`typescript
// app/classes/page.tsx
const fetchClasses = async () => {
  const response = await fetch("/api/classes")
  const data = await response.json()
  setClasses(data)
}

useEffect(() => {
  fetchClasses()
}, [])

const handleAddClass = async (classData) => {
  const response = await fetch("/api/classes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(classData),
  })
  
  if (response.ok) {
    await fetchClasses() // Refresh list
    setIsModalOpen(false)
  }
}
\`\`\`

#### 6. Evaluation Criteria
- ✅ All API endpoints implemented
- ✅ Proper HTTP methods and status codes
- ✅ Request validation
- ✅ Error handling
- ✅ Frontend integrated with APIs
- ✅ Data persists during session (or in database)
- ✅ TypeScript types maintained

---

## Bonus Points

- **Validation**: ✅ Zod schemas for all request bodies and query parameters
- **Rate Limiting**: ✅ Express rate-limit protecting API endpoints
- **Error Logging**: ✅ Winston logger with file and console transports
- **Authentication**: ✅ JWT authentication with protected routes and login UI
- **API Documentation**: ✅ OpenAPI/Swagger documentation available at `/api-docs`
- **Testing**: Add API tests with Jest or Vitest (optional)

---

## Time Management Tips

- **1 hour**: Choose your task and set up basics
- **2-3 hours**: Implement core functionality
- **30 min**: Test and debug
- **30 min**: Polish and document

## Common Pitfalls to Avoid

- Not handling errors properly
- Forgetting to update the frontend
- Missing input validation
- Not testing before submitting
- Hardcoding values instead of using environment variables

---

**Good luck with your implementation!**
