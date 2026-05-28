import cloudinary from "../config/cloudinary.js";
import { bufferToStream } from "../utils/stream.js";
import logger from "../utils/logger.js";

export type CloudinaryFolder = "artists" | "collectives" | "equipments" | "events";

export const uploadToCloudinary = (
  buffer: Buffer,
  filename: string,
  folder: CloudinaryFolder
): Promise<string> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) {
        logger.error("Erro no Cloudinary", { error });
        return reject(error);
      }
      resolve(result?.secure_url ?? "");
    });
    logger.debug("Iniciando upload Cloudinary", { filename });
    bufferToStream(buffer).pipe(stream);
  });
