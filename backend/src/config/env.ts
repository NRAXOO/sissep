import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT:           Number(process.env.PORT) || 4000,
  NODE_ENV:       process.env.NODE_ENV    || 'development',
  JWT_SECRET:     process.env.JWT_SECRET  || 'dev_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '8h',
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: Number(process.env.DB_PORT) || 5432,
    USER: process.env.DB_USER || 'sissep_user',
    PASS: process.env.DB_PASS || 'sissep_pass',
    NAME: process.env.DB_NAME || 'sissep_db',
  },
  MONGO_URI:    process.env.MONGO_URI    || 'mongodb://localhost:27017/sissep_docs',
  UPLOAD_DIR:   process.env.UPLOAD_DIR   || 'uploads',
  MAX_FILE_MB:  Number(process.env.MAX_FILE_MB) || 10,
};
