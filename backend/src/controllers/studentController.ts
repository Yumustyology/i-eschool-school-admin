import { Request, Response } from 'express';
import { Student } from '../models/Student';
import { logActivity } from '../utils/activityLogger';

export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students', details: (error as Error).message });
  }
};

export const getStudentsByClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { className } = req.query;
    
    if (!className) {
      res.status(400).json({ error: 'className query parameter is required' });
      return;
    }

    const students = await Student.find({ className }).sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students', details: (error as Error).message });
  }
};

export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, className, email, status } = req.body;

    const newStudent = new Student({
      name,
      className,
      email: email || '',
      status: status || 'Active',
    });

    await newStudent.save();
    await logActivity({
      action: 'Student enrolled',
      entityType: 'student',
      entityId: newStudent._id.toString(),
      description: `${newStudent.name} - ${newStudent.className}`,
    });
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create student', details: (error as Error).message });
  }
};

export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedStudent = await Student.findByIdAndDelete(id);
    
    if (!deletedStudent) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    await logActivity({
      action: 'Student deleted',
      entityType: 'student',
      entityId: deletedStudent._id.toString(),
      description: `${deletedStudent.name} - ${deletedStudent.className}`,
    });
    res.status(200).json({ message: 'Student deleted successfully', student: deletedStudent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete student', details: (error as Error).message });
  }
};

export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, className, email, status } = req.body;

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { name, className, email, status },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }
    await logActivity({
      action: 'Student updated',
      entityType: 'student',
      entityId: updatedStudent._id.toString(),
      description: `${updatedStudent.name} - ${updatedStudent.className}`,
    });
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student', details: (error as Error).message });
  }
};
