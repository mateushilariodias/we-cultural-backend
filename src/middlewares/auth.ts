import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = payload as Express.Request["user"];
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
}
