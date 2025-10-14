import multer from "multer";

// Armazenamento em memória (não salva no disco)
const storage = multer.memoryStorage();
export const upload = multer({ storage });
