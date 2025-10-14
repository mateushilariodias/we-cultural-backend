import mongoose, { Schema, Document } from "mongoose";

export interface IEquipment extends Document {
  name: string;
  cnpj: string;
  foundationYear?: number;
  responsible: string;
  phone: string;
  email: string;
  website?: string;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
  };
  category: string[];
  description?: string;
  password: string;
  logo?: string;
}

const equipmentSchema = new Schema<IEquipment>({
  name: { type: String, required: true },
  cnpj: { type: String, required: true },
  foundationYear: { type: Number },
  responsible: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  website: { type: String },
  address: {
    street: { type: String, required: true },
    neighborhood: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
  },
  category: { type: [String], required: true },
  description: { type: String },
  password: { type: String, required: true },
  logo: { type: String },
});

export default mongoose.model<IEquipment>("Equipment", equipmentSchema);
