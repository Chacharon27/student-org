import { Schema, model, Document, Types } from 'mongoose';

export interface IRegistration extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  event: Types.ObjectId;
  status: 'registered' | 'cancelled' | 'attended';
  registeredAt: Date;
}

const regSchema = new Schema<IRegistration>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    status: {
      type: String,
      enum: ['registered', 'cancelled', 'attended'],
      default: 'registered',
    },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

regSchema.index({ user: 1, event: 1 }, { unique: true });

export const Registration = model<IRegistration>('Registration', regSchema);
