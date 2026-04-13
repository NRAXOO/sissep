# SISSEP – Sistema de Seguimiento de Servicios Escolares y Procesos

> Plataforma web institucional para gestionar trámites documentales de **Servicio Social** y **Residencias Profesionales** en el Tecnológico Nacional de México.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-compose-2496ED?style=flat-square&logo=docker&logoColor=white)

---

## ¿Qué es SISSEP?

SISSEP permite a los estudiantes subir sus documentos requeridos desde cualquier navegador y a los encargados administrativos revisar, aprobar o rechazar cada documento con observaciones en tiempo real. Elimina la gestión manual de expedientes en papel.

```
Estudiante  →  sube documentos  →  Encargado los revisa  →  Aprueba o rechaza con observaciones
```

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js · React · TypeScript · Tailwind CSS |
| Backend | Node.js · Express · TypeScript · MVC |
| Base de datos relacional | PostgreSQL 16 (TypeORM) |
| Base de datos documental | MongoDB 7 (Mongoose) |
| Autenticación | JWT |
| Cifrado de contraseñas | bcryptjs |
| Control de acceso | RBAC – middleware de roles |
| Subida de archivos | Multer |
| Seguridad HTTP | Helmet · CORS |
| Contenedores | Docker Compose |

---

## Estructura del Proyecto

```
sissep/
├── backend/
│   ├── src/
│   │   ├── config/          # env.ts, database.ts
│   │   ├── controllers/     # auth.controller.ts, document.controller.ts
│   │   ├── middlewares/     # auth, upload, error
│   │   ├── models/
│   │   │   ├── pg/          # UserEntity.ts (TypeORM)
│   │   │   └── mongo/       # DocumentModel.ts (Mongoose)
│   │   ├── routes/          # auth.routes.ts, document.routes.ts
│   │   ├── services/        # auth.service.ts, document.service.ts
│   │   ├── types/           # tipos compartidos
│   │   ├── utils/           # jwt.ts, hash.ts, response.ts
│   │   └── server.ts        # Entry point
│   ├── uploads/             # Archivos subidos por estudiantes
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/login/    # Página de inicio de sesión
│   │   ├── dashboard/
│   │   │   ├── (student)/   # Panel del estudiante
│   │   │   └── (admin)/     # Panel del encargado
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/ui/       # StatusPill, Spinner
│   ├── context/             # AuthContext.tsx (JWT)
│   ├── lib/                 # api.ts (cliente HTTP)
│   ├── types/               # tipos TS
│   └── .env.local
│
├── database/
│   └── init.sql             # Schema PostgreSQL inicial
└── docker-compose.yml       # PostgreSQL + MongoDB
```

---

## Requisitos Previos

- [Node.js](https://nodejs.org) >= 18
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- npm >= 9

> ⚠️ **Windows**: corre todos los comandos en **PowerShell**, no en WSL.

---

## Instalación y Arranque

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/sissep.git
cd sissep
```

### 2. Levanta las bases de datos

```bash
docker compose up -d
```

Verifica que estén corriendo:

```bash
docker ps
# sissep_postgres  →  puerto 5432
# sissep_mongo     →  puerto 27017
```

### 3. Configura el backend

```bash
cd backend
cp .env.example .env   # ajusta credenciales si es necesario
npm install
npm run dev
```

Deberías ver:

```
🚀  SISSEP API corriendo en http://localhost:4000
[DB] PostgreSQL conectado
[DB] MongoDB conectado
```

### 4. Configura el frontend

```bash
cd ../frontend
npm install
npm run dev
```

La app queda disponible en **http://localhost:3000**

---

## Registro de Usuarios

El sistema no tiene pantalla de registro pública. Los usuarios se crean vía API.

### Registrar encargado (PowerShell)

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/v1/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"controlNumber":"admin","name":"Nombre Encargado","password":"admin123","role":"encargado","encargadoSection":"ISC"}'
```

### Registrar estudiante (PowerShell)

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/api/v1/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"controlNumber":"20240123","name":"Nombre Estudiante","password":"sicenet123","role":"estudiante","carrera":"Ingenieria en Sistemas Computacionales"}'
```

> También puedes usar **Postman** o **Insomnia** apuntando a `POST http://localhost:4000/api/v1/auth/register`.

---

## API Endpoints

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Público | Registrar usuario |
| `POST` | `/api/v1/auth/login` | Público | Iniciar sesión → JWT |
| `GET` | `/api/v1/auth/me` | 🔐 Cualquiera | Usuario autenticado actual |
| `GET` | `/api/v1/documents` | 🔐 Estudiante | Mis documentos (crea catálogo automáticamente) |
| `POST` | `/api/v1/documents/upload` | 🔐 Estudiante | Subir archivo (multipart/form-data) |
| `GET` | `/api/v1/documents/progress` | 🔐 Encargado | Progreso de todos los estudiantes |
| `PATCH` | `/api/v1/documents/:id/review` | 🔐 Encargado | Aprobar o rechazar documento |

Todas las rutas protegidas requieren el header:

```
Authorization: Bearer <token_jwt>
```

---

## Roles y Permisos

| Rol | Acceso |
|---|---|
| `estudiante` | Ver sus documentos, subir archivos, ver observaciones |
| `encargado` | Ver todos los estudiantes, aprobar/rechazar documentos, agregar observaciones |

---

## Documentos Requeridos

El catálogo se crea automáticamente en MongoDB la primera vez que el estudiante entra al panel.

**Servicio Social (18 documentos)**

| # | Documento |
|---|---|
| 1 | Solicitud de Servicio Social |
| 2 | Carta de Aceptación |
| 3 | Carta de Presentación |
| 4 | Carta de Asignación |
| 5 | Plan de Trabajo |
| 6 | Cronograma de Actividades |
| 7-12 | Reporte Mensual 1 al 6 |
| 13 | Informe Final |
| 14 | Carta de Terminación |
| 15 | Carta de Liberación |
| 16 | Evaluación del Prestador |
| 17 | Evaluación de la Institución |
| 18 | Constancia de Servicio Social |

**Residencias Profesionales (10 documentos)**

| # | Documento |
|---|---|
| 1 | Solicitud de Residencias |
| 2 | Carta de Aceptación |
| 3 | Anteproyecto |
| 4 | Carta de Presentación |
| 5-7 | Reporte Parcial 1 al 3 |
| 8 | Reporte Final |
| 9 | Carta de Terminación |
| 10 | Evaluación del Residente |

---

## Variables de Entorno

Crea el archivo `backend/.env` basándote en `.env.example`:

```env
# Servidor
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=cambia_este_secreto_muy_seguro
JWT_EXPIRES_IN=8h

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=sissep_user
DB_PASS=sissep_pass
DB_NAME=sissep_db

# MongoDB
MONGO_URI=mongodb://localhost:27017/sissep_docs

# Archivos
UPLOAD_DIR=uploads
MAX_FILE_MB=10
```

---

## Subida de Archivos

- **Formatos permitidos:** PDF, DOC, DOCX, JPG, JPEG, PNG
- **Tamaño máximo:** 10 MB (configurable con `MAX_FILE_MB`)
- **Almacenamiento:** `backend/uploads/` con nombre único
- Al reemplazar un archivo, el anterior se elimina automáticamente del disco

---

## Seguridad

- Contraseñas hasheadas con **bcryptjs** (12 salt rounds)
- Tokens **JWT** con expiración de 8 horas
- **RBAC** en cada ruta protegida del backend
- **Helmet** para headers de seguridad HTTP
- **CORS** restringido al origen del frontend
- Validación de tipo y tamaño de archivo antes de guardar
- Variables sensibles en `.env` excluidas del repositorio

---

## Solución de Problemas

**`Cannot GET /` en localhost:4000**
> Normal. Verifica el backend en `http://localhost:4000/health`, debe responder `{"ok":true}`.

**`Failed to connect to localhost` desde WSL**
> Corre el backend desde PowerShell de Windows, no desde WSL.

**`column does not exist` en PostgreSQL**
> Borra la tabla y deja que TypeORM la recree:
> ```bash
> docker exec -it sissep_postgres psql -U sissep_user -d sissep_db -c "DROP TABLE IF EXISTS users CASCADE;"
> ```

**Panel de documentos vacío**
> Los documentos se crean al entrar al panel por primera vez. Verifica que MongoDB esté corriendo con `docker ps`.

**`Credenciales incorrectas` al hacer login**
> Registra el usuario primero con el endpoint de registro. No hay usuarios precargados.

---

## Licencia

MIT © 2024 – Tecnológico Nacional de México
