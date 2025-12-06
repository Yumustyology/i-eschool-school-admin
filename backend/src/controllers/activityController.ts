import { Request, Response } from 'express';
import { Activity } from '../models/Activity';

export const getActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const page = Number(req.query.page ?? 1);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Activity.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Activity.countDocuments(),
    ]);

    res.status(200).json({
      items: items.map((a) => ({
        ...a,
        _id: a._id.toString(),
        createdAt: a.createdAt,
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities', details: (error as Error).message });
  }
};
