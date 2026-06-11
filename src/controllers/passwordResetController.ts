import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Artist from "../models/artistModel.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import logger from "../utils/logger.js";

const JWT_SECRET = process.env.JWT_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

type ResetTokenPayload = { id: string; email: string };

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "E-mail é obrigatório" });
    }

    const artist = await Artist.findOne({ email });
    if (!artist) {
      return res.json({
        message: "Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.",
      });
    }

    const resetToken = jwt.sign({ id: artist._id, email: artist.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `${FRONTEND_URL}/redefinir-senha?token=${resetToken}`;
    logger.info("Token de reset gerado", { email });

    try {
      await sendPasswordResetEmail(email, resetToken, artist.name);
      logger.info("E-mail de reset enviado", { email });
    } catch (emailError) {
      logger.warn("Erro ao enviar e-mail de reset", { emailError });
      if (process.env.NODE_ENV === "production") {
        return res.status(500).json({ message: "Erro ao enviar e-mail. Tente novamente mais tarde." });
      }
    }

    res.json({
      message: "Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.",
      ...(process.env.NODE_ENV === "development" && { resetLink }),
    });
  } catch (error) {
    logger.error("Erro ao solicitar reset", { error });
    res.status(500).json({ message: "Erro ao processar solicitação" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token e nova senha são obrigatórios" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres" });
    }

    let decoded: ResetTokenPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as ResetTokenPayload;
    } catch {
      return res.status(401).json({ message: "Token inválido ou expirado" });
    }

    const artist = await Artist.findById(decoded.id);
    if (!artist) {
      return res.status(404).json({ message: "Artista não encontrado" });
    }

    artist.password = await bcrypt.hash(newPassword, 10);
    await artist.save();

    logger.info("Senha redefinida com sucesso", { email: artist.email });
    res.json({ message: "Senha redefinida com sucesso! Você já pode fazer login." });
  } catch (error) {
    logger.error("Erro ao resetar senha", { error });
    res.status(500).json({ message: "Erro ao redefinir senha" });
  }
};
