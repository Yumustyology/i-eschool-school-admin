# i-eSchool Backend API

Express.js backend for the i-eSchool Admin Panel with MongoDB and activity logging.

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in `backend/` (already git-ignored):
```
MONGODB_URI=mongodb://localhost:27017/i-eschool
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```
For Atlas, swap the URI accordingly. See `.env.example` for a template.

**Important**: Change `JWT_SECRET` to a strong random string in production!

### 3. Run the Backend

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The backend will be available at `http://localhost:5000`

## API Documentation

**Interactive Swagger UI**: Navigate to `http://localhost:5000/api-docs` to explore all available endpoints with:
- Complete request/response schemas
- Try-it-out functionality for testing endpoints
- Parameter descriptions and examples
- Response status codes and error formats

All API endpoints are documented using OpenAPI 3.0 specification.

## API Endpoints

**Enhanced with:**
- ✅ JWT Authentication (Bearer token required for protected routes)
- ✅ Zod request validation on all endpoints
- ✅ Rate limiting (100 req/15min general, 20 req/15min for Teams)
- ✅ Winston logging (errors + combined logs in `logs/`)

### Authentication (Public Routes)
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/auth/profile` - Get authenticated user profile (requires token)

**All routes below require authentication** - Include `Authorization: Bearer <token>` header

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create a new class
- `PUT /api/classes/:id` - Update a class
- `DELETE /api/classes/:id` - Delete a class

### Students
- `GET /api/students` - Get all students
- `GET /api/students/class?className=Biology101` - Get students by class
- `POST /api/students` - Create a new student
- `PUT /api/students/:id` - Update a student
- `DELETE /api/students/:id` - Delete a student

### Attendance
- `GET /api/attendance` - Get attendance records (with filters: className, date, studentId)
- `POST /api/attendance` - Save attendance records (bulk)
- `PUT /api/attendance/:id` - Update an attendance record
- `DELETE /api/attendance/:id` - Delete an attendance record

### Activity Log
- `GET /api/activity` - List activities (supports `page`, `limit`)

### Health Check
- `GET /api/health` - Check if backend is running

## Database Schema

### Classes Collection
```javascript
{
  _id: ObjectId,
  name: String (unique),
  teacher: String,
  numberOfStudents: Number,
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Students Collection
```javascript
{
  _id: ObjectId,
  name: String,
  className: String,
  email: String,
  status: 'Active' | 'Inactive',
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance Collection
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: Student),
  studentName: String,
  className: String,
  date: Date,
  status: 'Present' | 'Absent',
  createdAt: Date
}
```

### Activity Collection
```javascript
{
  _id: ObjectId,
  action: String,
  entityType: String,
  entityId: String,
  description: String,
  metadata: Mixed,
  createdAt: Date
}
```

## Notes

- MongoDB must be running or accessible via the connection string
- CORS is enabled for frontend communication
- All timestamps are stored in UTC
- Attendance records are unique per student per date

## Security & Best Practices

- **Input Validation**: Zod schemas validate all request bodies and query params
- **Rate Limiting**: API protected against abuse (100 requests/15min, 20 for Teams)
- **Error Logging**: Winston logs errors to `logs/error.log` and all requests to `logs/combined.log`
- **Type Safety**: Full TypeScript coverage with strict validation

## Development

Logs are written to `backend/logs/` (git-ignored). Check `combined.log` for request logs and `error.log` for errors.
