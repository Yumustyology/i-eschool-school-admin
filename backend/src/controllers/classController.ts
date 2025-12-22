import { Request, Response } from 'express';
import { Class } from '../models/Class';
import { logActivity } from '../utils/activityLogger';

export const getAllClasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const classes = await Class.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch classes', details: (error as Error).message });
  }
};

export const createClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, teacher, description } = req.body;

    const newClass = new Class({
      name,
      teacher,
      description: description || '',
      numberOfStudents: 0,
    });

    await newClass.save();
    await logActivity({
      action: 'Class created',
      entityType: 'class',
      entityId: newClass._id.toString(),
      description: `${name} (Teacher: ${teacher})`,
    });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create class', details: (error as Error).message });
  }
};

export const deleteClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedClass = await Class.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    
    if (!deletedClass) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }
    await logActivity({
      action: 'Class deleted',
      entityType: 'class',
      entityId: deletedClass._id.toString(),
      description: deletedClass.name,
    });
    res.status(200).json({ message: 'Class deleted successfully', class: deletedClass });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete class', details: (error as Error).message });
  }
};

export const updateClass = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, teacher, description, numberOfStudents } = req.body;

    const updatedClass = await Class.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { name, teacher, description, numberOfStudents },
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      res.status(404).json({ error: 'Class not found' });
      return;
    }
    await logActivity({
      action: 'Class updated',
      entityType: 'class',
      entityId: updatedClass._id.toString(),
      description: updatedClass.name,
    });
    res.status(200).json(updatedClass);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update class', details: (error as Error).message });
  }
};
