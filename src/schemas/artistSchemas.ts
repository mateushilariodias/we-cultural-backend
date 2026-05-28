import { z } from "zod";

export const createArtistSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  phone: z.string().min(8, "Telefone inválido"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  gender: z.string().min(1, "Gênero é obrigatório"),
  resumeLink: z.string().url("Link do currículo inválido").or(z.literal("")),
  portfolioLink: z.string().url("Link do portfólio inválido").or(z.literal("")),
  socialLink: z.string().url("Link social inválido").or(z.literal("")).optional(),
  categories: z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v : [v])),
  lgbtqiapn: z.coerce.boolean().optional(),
  black: z.coerce.boolean().optional(),
  indigenous: z.coerce.boolean().optional(),
  pcd: z.coerce.boolean().optional(),
});
