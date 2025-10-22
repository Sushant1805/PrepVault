import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = globalThis._mongoose;
if (!cached) {
  cached = globalThis._mongoose = { conn: null, promise: null };
}

export async function connectToMongoose() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    mongoose.set('strictQuery', false);
    cached.promise = mongoose.connect(uri).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToMongoose;
