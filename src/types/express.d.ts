import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
      user?: JwtPayload | string;
    }
  }
}
