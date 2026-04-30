import { Schema, model, Document, Types } from 'mongoose';

export interface IAnnouncement extends Document {
  _id: Types.ObjectId;
  title: string;
  body: string;
  organization?: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  imageUrl?: string;
  pinned: boolean;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, maxlength: 5000 },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Announcement = model<IAnnouncement>('Announcement', announcementSchema);
