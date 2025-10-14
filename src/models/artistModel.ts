import mongoose, { Schema, Document } from "mongoose";

export interface IArtist extends Document {
  name: string;
  birthDate: string;
  email: string;
  phone: string;
  socialLink?: string;
  resumeLink: string;
  portfolioLink: string;
  gender: string;
  lgbtqiapn?: boolean;
  black?: boolean;
  indigenous?: boolean;
  pcd?: boolean;
  categories: string[];
  password: string;
  profilePicture?: string;
}

const ArtistSchema: Schema = new Schema({
  name: { type: String, required: true },
  birthDate: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  socialLink: { type: String },
  resumeLink: { type: String, required: true },
  portfolioLink: { type: String, required: true },
  gender: { type: String, required: true },
  lgbtqiapn: { type: Boolean, default: false },
  black: { type: Boolean, default: false },
  indigenous: { type: Boolean, default: false },
  pcd: { type: Boolean, default: false },
  categories: { type: [String], required: true },
  password: { type: String, required: true },
  profilePicture: { type: String },
});

export default mongoose.model<IArtist>("Artist", ArtistSchema);
