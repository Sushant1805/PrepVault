import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  googleId: { type: String, index: true, unique: true, sparse: true },
  email: { type: String, index: true, unique: true, sparse: true },
  // store bcrypt-hashed password for users registered with email/password
  password: { type: String },
  name: String,
  image: String,
  provider: String,
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now },
});

// Avoid model overwrite issue in development
const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
