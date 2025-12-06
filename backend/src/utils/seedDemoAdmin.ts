import bcrypt from 'bcryptjs';
import User from '../models/User';
import logger from '../config/logger';

export const ensureDemoAdminExists = async (): Promise<void> => {
  const email = 'admin@eschool.com';
  const password = 'admin123';
  const name = 'Demo Admin';
  const role = 'admin';

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    logger.info('Demo admin already exists', { email });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashedPassword, name, role });
  logger.info('Demo admin seeded', { email });
};
