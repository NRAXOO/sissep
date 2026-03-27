import { Schema, model, Document } from 'mongoose';
import { DocStatus, ProgramType } from '../../types';

export interface IDocumentRecord extends Document {
  studentId:    string;           // referencia al userId de Postgres
  programType:  ProgramType;
  category:     string;
  description:  string;
  status:       DocStatus;
  fileName?:    string;
  filePath?:    string;
  fileSize?:    number;
  observations: string[];         // historial de observaciones
  reviewedBy?:  string;
  createdAt:    Date;
  updatedAt:    Date;
}

const DocumentSchema = new Schema<IDocumentRecord>(
  {
    studentId:    { type: String, required: true, index: true },
    programType:  { type: String, enum: ['servicio_social','residencias'], required: true },
    category:     { type: String, required: true },
    description:  { type: String },
    status:       { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
    fileName:     { type: String },
    filePath:     { type: String },
    fileSize:     { type: Number },
    observations: { type: [String], default: [] },
    reviewedBy:   { type: String },
  },
  { timestamps: true }
);

export const DocumentModel = model<IDocumentRecord>('Document', DocumentSchema);
