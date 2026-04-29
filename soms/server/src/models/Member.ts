import { Schema, model, Document, Types } from 'mongoose';

export interface IMember extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  organization: Types.ObjectId;
  position: string;
  status: 'pending' | 'active' | 'inactive';
  joinedAt: Date;
}

const memberSchema = new Schema<IMember>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    position: { type: String, default: 'Member', trim: true, maxlength: 80 },
    status: {
      type: String,
      enum: ['pending', 'active', 'inactive'],
      default: 'pending',
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

memberSchema.index({ user: 1, organization: 1 }, { unique: true });

export const Member = model<IMember>('Member', memberSchema);
