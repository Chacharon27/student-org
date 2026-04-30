import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'student';
  studentId?: string;
  course?: string;
  yearLevel?: number;
  avatarUrl?: string;
  createdAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ['admin', 'student'], default: 'student' },
    studentId: { type: String, trim: true },
    course: { type: String, trim: true },
    yearLevel: { type: Number, min: 1, max: 6 },
    avatarUrl: { type: String },
  },
  { timestamps: true },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { password, ...rest } = ret as { password?: string };
    return rest;
  },
});

export const User = model<IUser>('User', userSchema);
