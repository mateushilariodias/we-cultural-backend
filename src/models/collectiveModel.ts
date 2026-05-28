import mongoose, { Schema, Document } from "mongoose";

export interface ICollective extends Document {
  name: string;
  description: string;
  profilePicture?: string;
  phone: string;
  socialLink: string;
  numMembers: number;
  memberNames: string[];
  categories: string[];
  password: string;
}

const collectiveSchema = new Schema<ICollective>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    profilePicture: { type: String },
    phone: { type: String, required: true },
    socialLink: { type: String, required: true },
    numMembers: { type: Number, required: true },
    memberNames: { type: [String], required: true },
    categories: { type: [String], required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICollective>("Collective", collectiveSchema);
