-- ═══════════════════════════════════════════════
--  SISSEP – Inicialización de base de datos
--  PostgreSQL
-- ═══════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  control_number   VARCHAR(20) UNIQUE NOT NULL,
  name             VARCHAR(120) NOT NULL,
  password_hash    TEXT NOT NULL,
  role             VARCHAR(20) NOT NULL DEFAULT 'estudiante'
                   CHECK (role IN ('estudiante','encargado')),
  carrera          VARCHAR(120),
  encargado_section VARCHAR(80),
  createdAt        TIMESTAMPTZ DEFAULT NOW(),
  updatedAt        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_control_number ON users(control_number);

-- Usuario encargado de prueba (password: admin123)
INSERT INTO users (control_number, name, password_hash, role, encargado_section)
VALUES (
  'admin',
  'Encargado Admin',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBFQ2bJBR8QnBC',
  'encargado',
  'ISC'
) ON CONFLICT DO NOTHING;

COMMENT ON TABLE users IS 'Usuarios del sistema SISSEP (estudiantes y encargados)';