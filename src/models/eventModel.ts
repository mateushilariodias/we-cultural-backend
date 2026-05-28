import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  dayOfWeek: string;
  time: string;
  location: string;
  address: string;
  image: string;
  details: string[];
  dates: Date[];
  artist: string;
  link: string;
  social: {
    instagram?: string;
    facebook?: string;
  };
  color: string;
  isActive: boolean;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    dayOfWeek: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    address: { type: String, required: true },
    image: { type: String, default: "" },
    details: { type: [String], default: [] },
    dates: { type: [Date], default: [] },
    artist: { type: String, default: "" },
    link: { type: String, default: "" },
    social: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
    },
    color: { type: String, default: "from-blue-500 to-cyan-500" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IEvent>("Event", eventSchema);
