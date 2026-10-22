import { AppDataSource }                 from '../config/database';
import { UserEntity }                    from '../models/UserEntity';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken }                     from '../utils/jwt';
import { UserRole }                      from '../types';

const repo = () => AppDataSource.getRepository(UserEntity);

export async function registerUser(data: {
  controlNumber:     string;
  name:              string;
  password:          string;
  role:              UserRole;
  carrera?:          string;
  encargadoSection?: string;
}) {
  const exists = await repo().findOne({
    where: { controlNumber: data.controlNumber.trim() },
  });
  if (exists) throw new Error('El numero de control ya esta registrado');

  const user = repo().create({
    controlNumber:    data.controlNumber.trim(),
    name:             data.name.trim(),
    passwordHash:     await hashPassword(data.password),
    role:             data.role,
    carrera:          data.carrera?.trim()          || '',
    encargadoSection: data.encargadoSection?.trim() || '',
  });

  await repo().save(user);
  return { id: user.id, name: user.name, role: user.role, carrera: user.carrera };
}

export async function loginUser(controlNumber: string, password: string) {
  const user = await repo().findOne({
    where: { controlNumber: controlNumber.trim() },
  });

  // El mismo mensaje para usuario no encontrado y password incorrecto
  // evita revelar si el numero de control existe o no.
  if (!user) throw new Error('Credenciales incorrectas');

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new Error('Credenciales incorrectas');

  const token = signToken({
    userId:  user.id,
    role:    user.role,
    carrera: user.carrera,
    name:    user.name,
  });

  return {
    token,
    user: {
      id:      user.id,
      name:    user.name,
      role:    user.role,
      carrera: user.carrera,
    },
  };
}

export async function getAllStudents() {
  return repo().find({
    where:  { role: 'estudiante' },
    order:  { name: 'ASC' },
    select: ['id', 'controlNumber', 'name', 'carrera', 'createdAt'],
  });
}

export async function updateUser(id: string, data: {
  name?: string;
  controlNumber?: string;
  password?: string;
  carrera?: string;
}) {
  const user = await repo().findOne({ where: { id } });
  if (!user) throw new Error('Usuario no encontrado');

  if (data.name) user.name = data.name.trim();
  if (data.controlNumber) user.controlNumber = data.controlNumber.trim();
  if (data.carrera) user.carrera = data.carrera.trim();
  if (data.password) user.passwordHash = await hashPassword(data.password);

  await repo().save(user);
  return { id: user.id, name: user.name, controlNumber: user.controlNumber };
}

export async function deleteUser(id: string) {
  const user = await repo().findOne({ where: { id } });
  if (!user) throw new Error('Usuario no encontrado');
  await repo().remove(user);
  return { id };
}
