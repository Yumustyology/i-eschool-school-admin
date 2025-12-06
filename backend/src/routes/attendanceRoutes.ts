import { Router } from 'express';
import {
  getAttendance,
  getAttendanceByClassAndDate,
  markAttendance,
  saveAttendance,
  updateAttendance,
  deleteAttendance,
} from '../controllers/attendanceController';
import { validateBody, validateQuery } from '../middleware/validateRequest';
import {
  saveAttendanceSchema,
  markAttendanceSchema,
  attendanceQuerySchema,
  classIdQuerySchema,
} from '../validation/schemas';

const router = Router();

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get attendance records
 *     description: Retrieve attendance records with optional filtering
 *     tags: [Attendance]
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter by student ID
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Filter by class ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendance'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', validateQuery(attendanceQuerySchema), getAttendance);

/**
 * @swagger
 * /api/attendance/class-date:
 *   get:
 *     summary: Get attendance by class and date
 *     description: Retrieve attendance records for a specific class and date
 *     tags: [Attendance]
 *     parameters:
 *       - in: query
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/class-date', validateQuery(classIdQuerySchema), getAttendanceByClassAndDate);

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Save attendance record
 *     description: Create a new attendance record
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - classId
 *               - date
 *               - status
 *             properties:
 *               studentId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               classId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439012
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-15
 *               status:
 *                 type: string
 *                 enum: [present, absent, late]
 *                 example: present
 *     responses:
 *       201:
 *         description: Attendance saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateBody(saveAttendanceSchema), saveAttendance);

/**
 * @swagger
 * /api/attendance/mark:
 *   post:
 *     summary: Mark attendance
 *     description: Quick attendance marking endpoint
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - classId
 *               - status
 *             properties:
 *               studentId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               classId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439012
 *               status:
 *                 type: string
 *                 enum: [present, absent, late]
 *                 example: present
 *     responses:
 *       200:
 *         description: Attendance marked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/mark', validateBody(markAttendanceSchema), markAttendance);

/**
 * @swagger
 * /api/attendance/{id}:
 *   put:
 *     summary: Update attendance record
 *     description: Modify an existing attendance record
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [present, absent, late]
 *                 example: late
 *     responses:
 *       200:
 *         description: Attendance updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Attendance record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', updateAttendance);

/**
 * @swagger
 * /api/attendance/{id}:
 *   delete:
 *     summary: Delete attendance record
 *     description: Remove an attendance record from the system
 *     tags: [Attendance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     responses:
 *       200:
 *         description: Attendance deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Attendance deleted successfully
 *       404:
 *         description: Attendance record not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', deleteAttendance);

export default router;
