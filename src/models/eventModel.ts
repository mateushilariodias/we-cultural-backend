import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Event", eventSchema);