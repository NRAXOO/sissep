import { Request, Response, NextFunction } from 'express';
import { verifyToken }                     from '../utils/jwt';
import { fail }                            from '../utils/response';
import { UserRole }                        from '../types';

// Extiende Request para inyectar el usuario autenticado
declare global {
  namespace Express {
    interface Request { user?: { userId: string; role: UserRole; carrera: string } }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return fail(res, 'Token requerido', 401);

  try {
    const payload = verifyToken(authHeader.split(' ')[1]);
    req.user = { userId: payload.userId, role: payload.role, carrera: payload.carrera };
    next();
  } catch {
    return fail(res, 'Token inválido o expirado', 401);
  }
}

// RBAC – requiere uno o varios roles
export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role))
      return fail(res, 'No autorizado para este recurso', 403);
    next();
  };
}
