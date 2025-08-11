import mongoose from 'mongoose';

export default async function connectDB(uri) {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, { dbName: process.env.MONGO_DB_NAME || 'unityboard' });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}
