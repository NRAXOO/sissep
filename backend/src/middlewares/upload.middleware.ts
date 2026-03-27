import multer from 'multer';
import path   from 'path';
import { ENV } from '../config/env';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, ENV.UPLOAD_DIR),
  filename:    (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  allowed.includes(ext)
    ? cb(null, true)
    : cb(new Error(`Tipo de archivo no permitido: ${ext}`));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: ENV.MAX_FILE_MB * 1024 * 1024 },
});
