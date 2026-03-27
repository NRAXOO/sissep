export type UserRole = 'estudiante' | 'encargado';
export type DocStatus = 'pending' | 'approved' | 'rejected';
export type ProgramType = 'servicio_social' | 'residencias';

export interface JwtPayload {
  userId:  string;
  role:    UserRole;
  carrera: string;
}

export interface ApiResponse<T = unknown> {
  ok:      boolean;
  data?:   T;
  message?: string;
  errors?:  string[];
}
