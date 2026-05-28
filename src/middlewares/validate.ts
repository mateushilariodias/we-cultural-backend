import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

type ZodIssueBase = { path: PropertyKey[]; message: string };

export const validateBody =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue: ZodIssueBase) => ({
        field: issue.path.map(String).join("."),
        message: issue.message,
      }));
      res.status(400).json({ message: "Dados inválidos", errors });
      return;
    }
    req.body = result.data;
    next();
  };
