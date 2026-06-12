import nodemailer from "nodemailer";
import { setDefaultResultOrder } from "dns";
import logger from "../utils/logger.js";

setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  userName: string
) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/redefinir-senha?token=${resetToken}`;

    logger.info("Enviando email de reset", { email });

    const mailOptions = {
      from: `"Nós Cultural" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: "Redefinir sua senha - Nós Cultural",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Nós Cultural</h1>
          </div>
          
          <div style="background-color: #f9fafb; padding: 40px 20px; text-align: center;">
            <h2 style="color: #1e3a8a; margin-top: 0;">Redefinir Senha</h2>
            <p style="color: #666; font-size: 16px; margin: 20px 0;">Oi ${userName},</p>
            <p style="color: #666; font-size: 16px; margin: 20px 0;">
              Você solicitou para redefinir sua senha. Clique no botão abaixo para continuar:
            </p>
            
            <a href="${resetLink}" style="display: inline-block; background-color: #1e3a8a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold; font-size: 16px;">
              Redefinir Senha
            </a>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              Ou copie e cole este link no seu navegador:<br>
              <code style="background-color: #e5e7eb; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 10px; word-break: break-all;">${resetLink}</code>
            </p>
            
            <p style="color: #f59e0b; font-size: 13px; margin-top: 20px;">
              ⚠️ Este link expira em <strong>1 hora</strong>. Se você não solicitou redefinição de senha, ignore este email.
            </p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2025 Nós Cultural - Todos os direitos reservados.<br>
              <a href="https://noscultural.com" style="color: #1e3a8a; text-decoration: none;">Visitar site</a>
            </p>
          </div>
        </div>
      `,
    };

    // Enviar email
    const info = await transporter.sendMail(mailOptions);

    logger.info("Email enviado", { messageId: info.messageId });

    return info;
  } catch (error) {
    logger.error("Erro ao enviar email", { error });
    throw error;
  }
};
