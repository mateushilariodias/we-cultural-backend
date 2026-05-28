import mongoose, { Schema, Document } from "mongoose";

export interface IEquipment extends Document {
  name: string;
  cnpj: string;
  foundationYear?: string;
  responsible: string;
  phone: string;
  email: string;
  website?: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  category: string[];
  description?: string;
  password: string;
  logo?: string;
}

const EquipmentSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    cnpj: { type: String, required: true },
    foundationYear: { type: String },
    responsible: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String },
    rua: { type: String, required: true },
    bairro: { type: String, required: true },
    cidade: { type: String, required: true },
    estado: { type: String, required: true },
    cep: { type: String, required: true },
    category: { type: [String], required: true },
    description: { type: String },
    password: { type: String, required: true },
    logo: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IEquipment>("Equipment", EquipmentSchema);
