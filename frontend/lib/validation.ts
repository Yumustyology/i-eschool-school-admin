import { z } from 'zod';

export const classSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(255, 'Class name is too long'),
  teacher: z.string().min(1, 'Teacher name is required').max(255, 'Teacher name is too long'),
  description: z.string().max(1000, 'Description is too long').optional().or(z.literal('')),
});

export type ClassFormData = z.infer<typeof classSchema>;

export const studentSchema = z.object({
  name: z.string().min(1, 'Student name is required').max(255, 'Name is too long'),
  className: z.string().min(1, 'Class is required'),
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
});

export type StudentFormData = z.infer<typeof studentSchema>;

export const attendanceSchema = z.object({
  className: z.string().min(1, 'Class is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
});

export type AttendanceFormData = z.infer<typeof attendanceSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
