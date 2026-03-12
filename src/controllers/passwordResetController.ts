import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Artist from "../models/artistModel.js";
import { sendPasswordResetEmail } from "../services/emailService.js";

const JWT_SECRET = process.env.JWT_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ✅ GERAR TOKEN DE RESET
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        message: "Email é obrigatório" 
      });
    }

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
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const resetLink = `${FRONTEND_URL}/resetPassword?token=${resetToken}`;

    console.log("🔑 Token de reset gerado para:", email);
    console.log("🔗 Link de reset:", resetLink);

    // ✅ ENVIAR EMAIL COM NODEMAILER + GMAIL SMTP
    try {
      await sendPasswordResetEmail(email, resetToken, artist.name);
      console.log("📧 Email de reset enviado para:", email);
    } catch (emailError) {
      console.error("⚠️ Erro ao enviar email:", emailError);
      // Continua mesmo se email falhar (em desenvolvimento)
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ 
          message: "Erro ao enviar email. Tente novamente mais tarde." 
        });
      }
    }

    res.json({
      message: "Se o e-mail estiver cadastrado, você receberá instruções para redefinir sua senha.",
      // REMOVA ESTA LINHA EM PRODUÇÃO - apenas para desenvolvimento
      ...(process.env.NODE_ENV === 'development' && {
        resetLink: resetLink
      })
    });

  } catch (error) {
    console.error("❌ Erro ao solicitar reset:", error);
    res.status(500).json({ 
      message: "Erro ao processar solicitação",
      error: (error as Error).message 
    });
  }
};

// ✅ RESETAR SENHA COM TOKEN
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: "Token e nova senha são obrigatórios" 
      });
    }

    // Validar senha
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "A senha deve ter pelo menos 6 caracteres" 
      });
    }

    // Verificar token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.log("❌ Token inválido ou expirado");
      return res.status(401).json({ 
        message: "Token inválido ou expirado" 
      });
    }

    // Buscar artista
    const artist = await Artist.findById(decoded.id);
    if (!artist) {
      return res.status(404).json({ 
        message: "Artista não encontrado" 
      });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    artist.password = hashedPassword;
    await artist.save();

    console.log("✅ Senha redefinida para:", artist.email);

    res.json({ 
      message: "Senha redefinida com sucesso! Você já pode fazer login." 
    });

  } catch (error) {
    console.error("❌ Erro ao resetar senha:", error);
    res.status(500).json({ 
      message: "Erro ao redefinir senha",
      error: (error as Error).message 
    });
  }
};