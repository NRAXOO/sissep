export type UserRole   = 'estudiante' | 'encargado';
export type DocStatus  = 'pending' | 'approved' | 'rejected';
export type ProgramType = 'servicio_social' | 'residencias';

export interface User {
  id:      string;
  name:    string;
  role:    UserRole;
  carrera: string;
}

export interface DocumentRecord {
  _id:          string;
  studentId:    string;
  programType:  ProgramType;
  category:     string;
  description:  string;
  status:       DocStatus;
  fileName?:    string;
  fileSize?:    number;
  observations: string[];
  createdAt:    string;
}

export interface AuthState {
  user:  User | null;
  token: string | null;
}
