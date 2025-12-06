import { Request, Response } from 'express';
import { Attendance } from '../models/Attendance';
import { Student } from '../models/Student';
import { Class } from '../models/Class';
import { logActivity } from '../utils/activityLogger';

export const getAttendanceByClassAndDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classId, date } = req.query;

    if (!classId || !date) {
      res.status(400).json({ error: 'classId and date are required' });
      return;
    }

    const classDetails = await Class.findById(classId);
    if (!classDetails) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }

    const students = await Student.find({ className: classDetails.name }).lean();

    const startDate = new Date(date as string);
    const endDate = new Date(date as string);
    endDate.setDate(endDate.getDate() + 1);

    const attendanceRecords = await Attendance.find({
      className: classDetails.name,
      date: { $gte: startDate, $lt: endDate },
    }).lean();

    const attendanceMap = new Map<string, string>();
    attendanceRecords.forEach((record: any) => {
      attendanceMap.set(record.studentId.toString(), record.status);
    });

    const studentsWithAttendance = students.map((student: any) => ({
      studentId: student._id.toString(),
      studentName: student.name,
      status: attendanceMap.get(student._id.toString()) || 'Absent',
      className: student.className,
    }));

    res.status(200).json(studentsWithAttendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance', details: (error as Error).message });
  }
};

export const markAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId, classId, date, status } = req.body;

    if (!studentId || !classId || !date || !status) {
      res.status(400).json({ error: 'studentId, classId, date, and status are required' });
      return;
    }

    const [student, classDetails] = await Promise.all([
      Student.findById(studentId),
      Class.findById(classId),
    ]);

    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    if (!classDetails) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const existingAttendance = await Attendance.findOne({
      studentId,
      className: classDetails.name,
      date: { $gte: startDate, $lt: endDate },
    });

    if (existingAttendance) {
      existingAttendance.status = status;
      await existingAttendance.save();
      await logActivity({
        action: 'Attendance updated',
        entityType: 'attendance',
        entityId: existingAttendance._id.toString(),
        description: `${student.name} - ${classDetails.name} (${status})`,
      });
      res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        record: {
          ...existingAttendance.toObject(),
          _id: existingAttendance._id.toString(),
          studentId: existingAttendance.studentId.toString(),
        },
      });
    } else {
      const newAttendance = await Attendance.create({
        studentId,
        studentName: student.name,
        className: classDetails.name,
        date: new Date(date),
        status,
      });
      await logActivity({
        action: 'Attendance marked',
        entityType: 'attendance',
        entityId: newAttendance._id.toString(),
        description: `${student.name} - ${classDetails.name} (${status})`,
      });
      res.status(201).json({
        success: true,
        message: 'Attendance marked successfully',
        record: {
          ...newAttendance.toObject(),
          _id: newAttendance._id.toString(),
          studentId: newAttendance.studentId.toString(),
        },
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark attendance', details: (error as Error).message });
  }
};

export const getAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { className, date, studentId } = req.query;
    const query: any = {};

    if (className) {
      query.className = className;
    }

    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(date as string);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    if (studentId) {
      query.studentId = studentId;
    }

    const attendance = await Attendance.find(query).sort({ createdAt: -1 }).lean();

    const formattedAttendance = attendance.map((record: any) => ({
      ...record,
      _id: record._id.toString(),
      studentId: record.studentId.toString(),
    }));

    res.status(200).json(formattedAttendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance', details: (error as Error).message });
  }
};

export const saveAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { className, date, records } = req.body;

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    await Attendance.deleteMany({
      className,
      date: { $gte: startDate, $lt: endDate },
    });

    const attendanceRecords = records.map((record: Record<string, unknown>) => ({
      studentId: record.studentId,
      studentName: record.studentName,
      className,
      date: new Date(date),
      status: record.status,
    }));

    const savedRecords = await Attendance.insertMany(attendanceRecords);

    await logActivity({
      action: 'Attendance saved (bulk)',
      entityType: 'attendance',
      description: `${className} - ${savedRecords.length} records on ${new Date(date).toLocaleDateString()}`,
    });

    res.status(201).json({
      success: true,
      message: 'Attendance saved successfully',
      recordCount: savedRecords.length,
      records: savedRecords,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save attendance', details: (error as Error).message });
  }
};

export const updateAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedAttendance) {
      res.status(404).json({ error: 'Attendance record not found' });
      return;
    }
    await logActivity({
      action: 'Attendance updated',
      entityType: 'attendance',
      entityId: updatedAttendance._id.toString(),
      description: `${updatedAttendance.studentName} - ${updatedAttendance.className} (${status})`,
    });
    res.status(200).json(updatedAttendance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update attendance', details: (error as Error).message });
  }
};

export const deleteAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedAttendance = await Attendance.findByIdAndDelete(id);

    if (!deletedAttendance) {
      res.status(404).json({ error: 'Attendance record not found' });
      return;
    }
    await logActivity({
      action: 'Attendance deleted',
      entityType: 'attendance',
      entityId: deletedAttendance._id.toString(),
      description: `${deletedAttendance.studentName} - ${deletedAttendance.className}`,
    });
    res.status(200).json({ message: 'Attendance record deleted successfully', record: deletedAttendance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete attendance', details: (error as Error).message });
  }
};
