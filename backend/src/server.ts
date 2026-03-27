import 'reflect-metadata';
import express        from 'express';
import cors           from 'cors';
import helmet         from 'helmet';
import morgan         from 'morgan';
import { ENV }        from './config/env';
import { connectPostgres, connectMongo } from './config/database';
import apiRoutes      from './routes';
import { errorHandler } from './middlewares/error.middleware';
import path           from 'path';
import fs             from 'fs';

const app = express();

// ── Middlewares globales ──
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Carpeta de uploads ──
const uploadDir = path.resolve(ENV.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// ── Rutas ──
app.use('/api/v1', apiRoutes);

// ── Health check ──
app.get('/health', (_req, res) => res.json({ ok: true, env: ENV.NODE_ENV }));

// ── Error handler ──
app.use(errorHandler);

// ── Arranque ──
async function bootstrap() {
  await connectPostgres();
  await connectMongo();
  app.listen(ENV.PORT, () => {
    console.log(`\n🚀  SISSEP API corriendo en http://localhost:${ENV.PORT}`);
    console.log(`   Docs:   POST /api/v1/auth/login`);
    console.log(`   Health: GET  /health\n`);
  });
}

bootstrap().catch(err => { console.error(err); process.exit(1); });
