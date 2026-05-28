import { z } from "zod";

export const loginArtistSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const loginByNameSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
});
