import { DataSource } from 'typeorm';
import mongoose        from 'mongoose';
import { ENV }         from './env';
import { UserEntity }  from '../models/pg/UserEntity';

// ── PostgreSQL via TypeORM ──
export const AppDataSource = new DataSource({
  type:        'postgres',
  host:         ENV.DB.HOST,
  port:         ENV.DB.PORT,
  username:     ENV.DB.USER,
  password:     ENV.DB.PASS,
  database:     ENV.DB.NAME,
  synchronize:  false,//ENV.NODE_ENV === 'development',
  logging:      false,
  entities:     [UserEntity],
});

export async function connectPostgres() {
  await AppDataSource.initialize();
  console.log('[DB] PostgreSQL conectado');
}

// ── MongoDB via Mongoose ──
export async function connectMongo() {
  await mongoose.connect(ENV.MONGO_URI);
  console.log('[DB] MongoDB conectado');
}
