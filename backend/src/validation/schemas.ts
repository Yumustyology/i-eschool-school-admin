import { z } from 'zod';

export const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(255),
  teacher: z.string().min(1, 'Teacher name is required').max(255),
  description: z.string().max(1000).optional(),
});

export const updateClassSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  teacher: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  numberOfStudents: z.number().int().min(0).optional(),
});

export const createStudentSchema = z.object({
  name: z.string().min(1, 'Student name is required').max(255),
  className: z.string().min(1, 'Class name is required').max(255),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

export const updateStudentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  className: z.string().min(1).max(255).optional(),
  email: z.string().email().optional().or(z.literal('')),
  status: z.enum(['Active', 'Inactive']).optional(),
});

export const markAttendanceSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  status: z.enum(['Present', 'Absent']),
});

export const saveAttendanceSchema = z.object({
  className: z.string().min(1, 'Class name is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      studentName: z.string().min(1),
      status: z.enum(['Present', 'Absent']),
    })
  ).min(1, 'At least one attendance record is required'),
});

export const sendTeamsMessageSchema = z.object({
  webhookUrl: z.string().url('Invalid webhook URL').refine(
    (url) => url.includes('webhook.office.com'),
    'Must be a valid Microsoft Teams webhook URL'
  ),
  message: z.string().min(1, 'Message cannot be empty').max(5000),
});

export const attendanceQuerySchema = z.object({
  className: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  studentId: z.string().optional(),
});

export const classIdQuerySchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
});

export const activityQuerySchema = z.object({
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(255),
  role: z.enum(['admin', 'teacher']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

