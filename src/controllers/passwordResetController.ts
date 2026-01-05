import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Artist from "../models/artistModel.js";

// Gerar token de reset
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const artist = await Artist.findOne({ email });
    if (!artist) {
      // Por segurança, não revelar se o email existe ou não
      return res.json({ 
        message: "Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha." 
      });
    }

    // Gerar token de reset (válido por 1 hora)
    const resetToken = jwt.sign(
      { id: artist._id, email: artist.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    // Em produção, você enviaria este token por e-mail
    // Por enquanto, vamos retornar o link direto
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    console.log("🔑 Token de reset gerado para:", email);
    console.log("🔗 Link de reset:", resetLink);

    res.json({
      message: "Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.",
      // REMOVA ESTA LINHA EM PRODUÇÃO - apenas para desenvolvimento
      resetLink: resetLink
    });
  } catch (error) {
    console.error("❌ Erro ao solicitar reset:", error);
    res.status(500).json({ message: "Erro ao processar solicitação" });
  }
};

// Resetar senha com token
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token e nova senha são obrigatórios" });
    }

    // Verificar token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (error) {
      return res.status(401).json({ message: "Token inválido ou expirado" });
    }

    // Buscar artista
    const artist = await Artist.findById(decoded.id);
    if (!artist) {
      return res.status(404).json({ message: "Artista não encontrado" });
    }

    // Validar senha
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres" });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    artist.password = hashedPassword;
    await artist.save();

    console.log("✅ Senha redefinida para:", artist.email);

    res.json({ message: "Senha redefinida com sucesso! Você já pode fazer login." });
  } catch (error) {
    console.error("❌ Erro ao resetar senha:", error);
    res.status(500).json({ message: "Erro ao redefinir senha" });
  }
};