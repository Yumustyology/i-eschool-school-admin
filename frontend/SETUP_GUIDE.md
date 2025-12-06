# Setup Guide for Developers

Quick setup instructions for the i-eSchool Admin Panel technical interview exercise.

## Quick Start

### 1. Install Dependencies

Choose your preferred package manager:

**npm:**
\`\`\`bash
npm install
\`\`\`

**yarn:**
\`\`\`bash
yarn install
\`\`\`

**pnpm:**
\`\`\`bash
pnpm install
\`\`\`

### 2. Run Development Server

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Files Overview

### Core Application Files

**Required files to understand:**

\`\`\`
lib/types.ts              # TypeScript interfaces for all data models
lib/mock-data.ts          # Sample data (replace with database)
app/page.tsx              # Dashboard with developer notes
app/classes/page.tsx      # Classes management page
app/students/page.tsx     # Students management page
app/attendance/page.tsx   # Attendance tracking page
app/teams-integration/page.tsx  # Teams webhook UI
\`\`\`

### Configuration Files

\`\`\`
package.json              # Dependencies and scripts
tsconfig.json            # TypeScript configuration
next.config.mjs          # Next.js configuration
app/globals.css          # Global styles and design tokens
\`\`\`

### Components

\`\`\`
components/app-sidebar.tsx   # Navigation sidebar
components/app-header.tsx    # Top header bar
components/stat-card.tsx     # Dashboard statistics cards
components/ui/*              # shadcn/ui components (pre-built)
\`\`\`

## Interview Tasks

You need to complete **at least 1 of these 3 tasks**:

### Option 1: Database Integration

**Files to modify:**
- Create: `lib/db.ts` or similar for database connection
- Create: API routes in `app/api/`
- Modify: All page files to use API instead of local state

**Example database schema (PostgreSQL):**

\`\`\`sql
CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  teacher VARCHAR(255) NOT NULL,
  number_of_students INTEGER,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  class_name VARCHAR(255),
  email VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  student_name VARCHAR(255),
  class_name VARCHAR(255),
  date DATE NOT NULL,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Option 2: Microsoft Teams Integration

**Files to create:**
- `app/api/teams/send-message/route.ts`

**Example implementation:**

\`\`\`typescript
// app/api/teams/send-message/route.ts
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { webhookUrl, message } = await request.json()

    // Validate webhook URL
    if (!webhookUrl || !webhookUrl.includes("webhook.office.com")) {
      return NextResponse.json(
        { error: "Invalid webhook URL" },
        { status: 400 }
      )
    }

    // Send message to Teams
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to send message to Teams")
    }

    return NextResponse.json({ 
      success: true,
      message: "Message sent to Microsoft Teams successfully" 
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
\`\`\`

**Then modify:** `app/teams-integration/page.tsx` to call this API.

### Option 3: REST API Implementation

**Files to create:**

\`\`\`
app/api/classes/route.ts           # GET, POST for classes
app/api/classes/[id]/route.ts      # DELETE for specific class
app/api/students/route.ts          # GET, POST for students
app/api/students/[id]/route.ts     # DELETE for specific student
app/api/attendance/route.ts        # GET, POST for attendance
\`\`\`

**Example API route:**

\`\`\`typescript
// app/api/classes/route.ts
import { NextResponse } from "next/server"

// In-memory storage (replace with database)
let classes = [...]

export async function GET() {
  return NextResponse.json(classes)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newClass = {
    id: Date.now().toString(),
    ...body,
  }
  classes.push(newClass)
  return NextResponse.json(newClass, { status: 201 })
}
\`\`\`

## Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Database (if using Task 1)
DATABASE_URL=postgresql://user:password@localhost:5432/eschool

# Or MongoDB
MONGODB_URI=mongodb://localhost:27017/eschool

# Teams Webhook (if using Task 2)
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...
\`\`\`

**Note**: `.env.local` is already in `.gitignore`

## Common Issues & Solutions

### Issue: Port 3000 already in use

\`\`\`bash
# Use a different port
npm run dev -- -p 3001
\`\`\`

### Issue: TypeScript errors

\`\`\`bash
# The build will still work - TypeScript errors are ignored in next.config.mjs
# But you should fix them for best practices
\`\`\`

### Issue: Module not found

\`\`\`bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

## Testing Your Implementation

### Test Database Integration:
1. Add a new class from the Classes page
2. Refresh the page - data should persist
3. Check your database to confirm data was saved

### Test Teams Integration:
1. Get a Teams webhook URL (create a Teams channel, add "Incoming Webhook" connector)
2. Paste it in the Teams Integration page
3. Send a test message
4. Check your Teams channel for the message

### Test APIs:
1. Use Postman or curl to test endpoints:
\`\`\`bash
curl http://localhost:3000/api/classes
curl -X POST http://localhost:3000/api/classes \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Class","teacher":"Test Teacher","numberOfStudents":0}'
\`\`\`

## Helpful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Microsoft Teams Webhooks](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook)

## Tips for Success

1. **Start with the API layer** - Get your endpoints working before connecting to UI
2. **Use TypeScript** - The types are already defined in `lib/types.ts`
3. **Test incrementally** - Test each feature as you build it
4. **Keep it simple** - Focus on functionality over fancy features
5. **Document your code** - Add comments explaining your approach

## Time Estimates

- **Database Integration**: 2-3 hours
- **Teams Integration**: 1-2 hours
- **REST APIs**: 2-4 hours

Choose based on your available time and comfort level.

## Questions?

Review the main [README.md](./README.md) for full project documentation.

Good luck with your interview!
