import { Schema, model, Document, Types } from 'mongoose';

export interface IEvent extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  organization: Types.ObjectId;
  startsAt: Date;
  endsAt: Date;
  location: string;
  capacity: number;
  posterUrl?: string;
  createdBy: Types.ObjectId;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, maxlength: 4000 },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    location: { type: String, required: true, maxlength: 200 },
    capacity: { type: Number, default: 0, min: 0 },
    posterUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const Event = model<IEvent>('Event', eventSchema);
