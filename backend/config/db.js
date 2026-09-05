import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB Atlas] Connected successfully to: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`\n❌ [MongoDB Atlas Connection Failed]: ${error.message}`);
    console.error(`\n⚠️ HOW TO FIX ATLAS ACCESS:`);
    console.error(`1. Go to https://cloud.mongodb.com/`);
    console.error(`2. In the left sidebar under "Security", click "Network Access"`);
    console.error(`3. Click "+ Add IP Address"`);
    console.error(`4. Select "Allow Access from Anywhere" (0.0.0.0/0) or "Add Current IP Address" and click "Confirm"`);
    console.error(`5. Wait 30 seconds for Atlas to apply changes, then re-run your command.\n`);
    throw error;
  }
};
