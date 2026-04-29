import { Schema, model, Document, Types } from 'mongoose';

export interface IOrganization extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  category: string;
  logoUrl?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
}

const orgSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true, maxlength: 2000 },
    category: { type: String, required: true, trim: true },
    logoUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const Organization = model<IOrganization>('Organization', orgSchema);
