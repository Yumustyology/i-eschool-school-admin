import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import logger from '../config/logger';
import { logActivity } from '../utils/activityLogger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists with this email' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: role || 'teacher',
    });

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    logger.info('User registered', { email, userId: user._id });
    await logActivity({
      action: 'user_registered',
      entityType: 'user',
      entityId: user._id.toString(),
      description: `New user registered: ${name} (${email})`,
      metadata: { role: user.role },
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    logger.info('User logged in', { email, userId: user._id });
    await logActivity({
      action: 'user_login',
      entityType: 'user',
      entityId: user._id.toString(),
      description: `User logged in: ${user.name}`,
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};
