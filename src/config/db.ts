import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect('mongodb://localhost:27017/partyFlags', {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Test the connection by listing collections
    if (conn.connection.db) {
      const collections = await conn.connection.db.listCollections().toArray();
      console.log('Available collections:', collections.map((c: { name: string }) => c.name));
    }
    
    return conn;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`MongoDB Connection Error: ${error.message}`);
    } else {
      console.error('An unknown error occurred while connecting to MongoDB');
    }
    process.exit(1);
  }
};

export default connectDB;
