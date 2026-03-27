import { AppDataSource }  from '../config/database';
import { UserEntity }     from '../models/pg/UserEntity';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken }      from '../utils/jwt';
import { UserRole }       from '../types';

const repo = () => AppDataSource.getRepository(UserEntity);

export async function registerUser(data: {
  controlNumber: string; name: string; password: string;
  role: UserRole; carrera?: string; encargadoSection?: string;
}) {
  const exists = await repo().findOne({ where: { controlNumber: data.controlNumber } });
  if (exists) throw new Error('El número de control ya está registrado');

  const user = repo().create({
    controlNumber:    data.controlNumber,
    name:             data.name,
    passwordHash:     await hashPassword(data.password),
    role:             data.role,
    carrera:          data.carrera          || '',
    encargadoSection: data.encargadoSection || '',
  });
  await repo().save(user);
  return { id: user.id, name: user.name, role: user.role };
}

export async function loginUser(controlNumber: string, password: string) {
  const user = await repo().findOne({ where: { controlNumber } });
  if (!user) throw new Error('Credenciales incorrectas');

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new Error('Credenciales incorrectas');

  const token = signToken({ userId: user.id, role: user.role, carrera: user.carrera });
  return {
    token,
    user: { id: user.id, name: user.name, role: user.role, carrera: user.carrera },
  };
}