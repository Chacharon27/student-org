import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // 👈 load .env

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('❌ MONGO_URI is not defined in .env');
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error(`❌ MongoDB connection failed at ${uri}`);
    console.error(error);
    throw error;
  }
}