import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import connectToMongoose from '../../../../lib/mongoose';
import User from '../../../../models/User';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name } = body || {};

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    await connectToMongoose();

    const existing = await User.findOne({ email }).exec();
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);

    const user = new User({ email, password: hashed, name, provider: 'credentials', createdAt: new Date(), lastLogin: new Date() });
    await user.save();

    return NextResponse.json({ ok: true, user: { id: user._id.toString(), email: user.email, name: user.name } }, { status: 201 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
