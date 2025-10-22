import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import connectToMongoose from '../../../../lib/mongoose';
import User from '../../../../models/User';

export const options = {
    providers: [
        // allow sign in via email + password
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email', placeholder: 'you@domain.com' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials, req) {
                // basic validation
                if (!credentials?.email || !credentials?.password) return null;
                try {
                    await connectToMongoose();
                    const user = await User.findOne({ email: credentials.email }).exec();
                    if (!user || !user.password) return null;
                    const match = await bcrypt.compare(credentials.password, user.password);
                    if (!match) return null;

                    // return a minimal user object NextAuth will put in the session
                    return { id: user._id.toString(), name: user.name, email: user.email, image: user.image };
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('Error in credentials authorize:', err);
                    return null;
                }
            },
        }),
        GoogleProvider({
            profile(profile) {
                // normalize profile
                return {
                    ...profile,
                    id: profile.sub,
                };
            },
            clientId: process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_SECRET,
        }),
    ],

    callbacks: {
        // When a user signs in, ensure they exist in our MongoDB users collection.
        async signIn({ user, account, profile, email, credentials }) {
            try {
                await connectToMongoose();

                // upsert user by google id or email
                const filter = {};
                if (profile?.sub) filter.googleId = profile.sub;
                if (user?.email) filter.email = user.email;

                const update = {
                    name: user?.name || profile?.name,
                    email: user?.email || profile?.email,
                    image: user?.image || profile?.picture || profile?.image,
                    provider: account?.provider || 'google',
                    lastLogin: new Date(),
                };

                await User.findOneAndUpdate(filter, { $set: update, $setOnInsert: { createdAt: new Date(), googleId: profile?.sub } }, { upsert: true, new: true });
                return true;
                    } catch (err) {
                        // eslint-disable-next-line no-console
                        console.error('Error in signIn callback (user upsert failed):', err);
                        // Do not block authentication if the database is temporarily unavailable.
                        // Returning `true` allows the OAuth sign-in to complete even when the
                        // upsert fails (prevents AccessDenied). Consider monitoring/logging
                        // these errors and retrying in the background if desired.
                        return true;
                    }
        },
    },
};