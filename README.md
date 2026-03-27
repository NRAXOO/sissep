# SISSEP – Sistema de Seguimiento de Servicios Escolares y Procesos

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js · React · TypeScript · Tailwind CSS · Axios/Fetch |
| Backend  | Node.js · Express · TypeScript · Arquitectura MVC |
| Base de datos relacional | PostgreSQL (TypeORM) |
| Base de datos documental | MongoDB (Mongoose) |
| Autenticación | JWT |
| Cifrado de contraseñas | bcryptjs |
| Control de acceso | RBAC (middleware de roles) |
| Subida de archivos | Multer |
| Seguridad HTTP | Helmet · CORS |

## Estructura del Proyecto

```
sissep/
├── backend/
│   ├── src/
│   │   ├── config/          # env, database
│   │   ├── controllers/     # auth, document
│   │   ├── middlewares/     # auth, upload, error
│   │   ├── models/
│   │   │   ├── pg/          # UserEntity (TypeORM)
│   │   │   └── mongo/       # DocumentModel (Mongoose)
│   │   ├── routes/          # auth, documents, index
│   │   ├── services/        # auth.service, document.service
│   │   ├── types/           # tipos compartidos
│   │   ├── utils/           # jwt, hash, response
│   │   └── server.ts        # entry point
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/login/    # página de login
│   │   ├── dashboard/
│   │   │   ├── (student)/   # panel estudiante
│   │   │   └── (admin)/     # panel encargado
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/ui/       # StatusPill, Spinner
│   ├── context/             # AuthContext (JWT)
│   ├── lib/                 # api client
│   ├── types/               # tipos TS compartidos
│   └── .env.local
│
├── database/
│   └── init.sql             # Schema PostgreSQL inicial
└── docker-compose.yml       # PostgreSQL + MongoDB
```

## Arranque rápido

### 1. Levantar bases de datos
```bash
cd sissep
docker compose up -d
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # ajusta credenciales si es necesario
npm run dev
# API en http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
npm run dev
# UI en http://localhost:3000
```

## API Endpoints

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | /api/v1/auth/register | público | Registrar usuario |
| POST | /api/v1/auth/login    | público | Iniciar sesión → JWT |
| GET  | /api/v1/auth/me       | 🔐 cualquiera | Usuario actual |
| GET  | /api/v1/documents     | 🔐 estudiante | Mis documentos |
| POST | /api/v1/documents/upload | 🔐 estudiante | Subir archivo |
| GET  | /api/v1/documents/progress | 🔐 encargado | Progreso de todos |
| PATCH | /api/v1/documents/:id/review | 🔐 encargado | Aprobar/Rechazar |

## Variables de entorno (backend)

```env
PORT=4000
JWT_SECRET=cambia_este_secreto
JWT_EXPIRES_IN=8h
DB_HOST=localhost
DB_PORT=5432
DB_USER=sissep_user
DB_PASS=sissep_pass
DB_NAME=sissep_db
MONGO_URI=mongodb://localhost:27017/sissep_docs
UPLOAD_DIR=uploads
MAX_FILE_MB=10
```
