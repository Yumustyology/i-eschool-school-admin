import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not set in the environment');
    }
    
    await mongoose.connect(mongoUri);
    
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', (error as Error).message);
    process.exit(1);
  }
};

export default connectDB;
