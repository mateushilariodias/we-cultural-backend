import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(2, "Título deve ter no mínimo 2 caracteres"),
  description: z.string().min(1, "Descrição é obrigatória"),
  date: z.string().min(1, "Data é obrigatória"),
  dayOfWeek: z.string().min(1, "Dia da semana é obrigatório"),
  time: z.string().min(1, "Horário é obrigatório"),
  location: z.string().min(1, "Local é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  artist: z.string().optional(),
  link: z.string().url("Link inválido").or(z.literal("")).optional(),
  color: z.string().optional(),
  details: z.string().optional(),
  dates: z.string().optional(),
  social: z.string().optional(),
});
