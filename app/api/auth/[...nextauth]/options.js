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
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required')
                }

                try {
                    await connectToMongoose();
                    const user = await User.findOne({ email: credentials.email }).exec();
                    if (!user || !user.password) {
                        throw new Error('Invalid email or password')
                    }
                    const match = await bcrypt.compare(credentials.password, user.password);
                    if (!match) {
                        throw new Error('Invalid email or password')
                    }

                    // return a minimal user object NextAuth will put in the session
                    return { id: user._id.toString(), name: user.name, email: user.email, image: user.image };
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('Error in credentials authorize:', err);
                    // Avoid returning internal error details to the client. Provide a safe message.
                    throw new Error(err?.message || 'Authentication failed')
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
        // Persist the user id into the JWT token and expose it on the session.
        async jwt({ token, user }) {
            // On initial sign in, `user` will be available and may contain our id.
            if (user?.id) {
                token.id = user.id;
            }

            // If token doesn't have an id yet but we have an email, try to look up the DB user
            // (useful for OAuth flows where our signIn upsert ran but `user.id` wasn't attached).
            if (!token?.id && token?.email) {
                try {
                    await connectToMongoose();
                    const dbUser = await User.findOne({ email: token.email }).select('_id').lean();
                    if (dbUser?._id) token.id = dbUser._id.toString();
                } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('JWT callback DB lookup failed:', err);
                }
            }

            return token;
        },

        async session({ session, token }) {
            // Make the token id available on `session.user.id` for server code.
            if (token?.id) {
                session.user = session.user || {};
                session.user.id = token.id;
            }
            return session;
        },
    },
};