import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  // Fail fast if the environment variable is missing
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = globalThis._mongo;

if (!cached) {
  cached = globalThis._mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const client = new MongoClient(uri);
    cached.promise = client.connect().then((client) => {
      // client.db() will return the database specified in the URI if present,
      // otherwise it returns the default (usually 'test').
      const db = client.db();
      return { client, db };
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
