import NextAuth from "next-auth";
import { options } from './options';
import connectToDatabase from '../../../../lib/mongodb';

// establish a cached connection at module load time so it isn't recreated
// on every request. connectToDatabase uses a global cache.
connectToDatabase().catch((err) => {
	// Log the error but don't crash the route registration — Next.js will
	// surface runtime errors for requests. This ensures the connection
	// attempt is made once when the module is loaded.
	// eslint-disable-next-line no-console
	console.error('MongoDB connection error (during module load):', err);
});

const handler = NextAuth(options);
export { handler as GET, handler as POST };