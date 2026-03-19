import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true, // formato: "20/03/2026"
  },
  dayOfWeek: {
    type: String,
    required: true, // "sexta-feira", "sábado", etc
  },
  time: {
    type: String,
    required: true, // "19:30"
  },
  location: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  image: {
    type: String, // URL da imagem
    default: "",
  },
  details: {
    type: [String],
    default: [],
  },
  dates: {
    type: [String],
    default: [], // para eventos com múltiplas datas
  },
  artist: {
    type: String,
    default: "",
  },
  link: {
    type: String,
    default: "",
  },
  social: {
    instagram: String,
    facebook: String,
  },
  color: {
    type: String,
    default: "from-blue-500 to-cyan-500",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Event", eventSchema);