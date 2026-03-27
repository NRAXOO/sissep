import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { UserRole } from '../../types';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'control_number', unique: true })
  controlNumber!: string;

  @Column({ name: 'name' })
  name!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'role', type: 'varchar', default: 'estudiante' })
  role!: UserRole;

  @Column({ name: 'carrera', nullable: true })
  carrera!: string;

  @Column({ name: 'encargado_section', nullable: true })
  encargadoSection!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}