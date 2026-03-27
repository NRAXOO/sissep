import { DocumentModel } from '../models/mongo/DocumentModel';
import { DocStatus, ProgramType } from '../types';
import fs from 'fs';
import path from 'path';

const DOCS_SS = [
  { category: 'Solicitud de Servicio Social',    description: 'Formato de solicitud oficial' },
  { category: 'Carta de Aceptación',             description: 'Carta de aceptación de la institución' },
  { category: 'Carta de Presentación',           description: 'Carta de presentación del estudiante' },
  { category: 'Carta de Asignación',             description: 'Carta de asignación oficial' },
  { category: 'Plan de Trabajo',                 description: 'Plan detallado de actividades' },
  { category: 'Cronograma de Actividades',       description: 'Calendario de actividades programadas' },
  { category: 'Reporte Mensual 1',               description: 'Primer reporte mensual de actividades' },
  { category: 'Reporte Mensual 2',               description: 'Segundo reporte mensual de actividades' },
  { category: 'Reporte Mensual 3',               description: 'Tercer reporte mensual de actividades' },
  { category: 'Reporte Mensual 4',               description: 'Cuarto reporte mensual de actividades' },
  { category: 'Reporte Mensual 5',               description: 'Quinto reporte mensual de actividades' },
  { category: 'Reporte Mensual 6',               description: 'Sexto reporte mensual de actividades' },
  { category: 'Informe Final',                   description: 'Informe final del servicio social' },
  { category: 'Carta de Terminación',            description: 'Carta de terminación del servicio' },
  { category: 'Carta de Liberación',             description: 'Carta de liberación oficial' },
  { category: 'Evaluación del Prestador',        description: 'Evaluación del prestador de servicio' },
  { category: 'Evaluación de la Institución',    description: 'Evaluación de la institución receptora' },
  { category: 'Constancia de Servicio Social',   description: 'Constancia oficial de servicio social' },
];

const DOCS_RP = [
  { category: 'Solicitud de Residencias',        description: 'Formato de solicitud oficial' },
  { category: 'Carta de Aceptación',             description: 'Carta de la empresa receptora' },
  { category: 'Anteproyecto',                    description: 'Documento de anteproyecto aprobado' },
  { category: 'Carta de Presentación',           description: 'Carta de presentación del estudiante' },
  { category: 'Reporte Parcial 1',               description: 'Primer reporte de avance' },
  { category: 'Reporte Parcial 2',               description: 'Segundo reporte de avance' },
  { category: 'Reporte Parcial 3',               description: 'Tercer reporte de avance' },
  { category: 'Reporte Final',                   description: 'Reporte final de la residencia' },
  { category: 'Carta de Terminación',            description: 'Carta de la empresa al finalizar' },
  { category: 'Evaluación del Residente',        description: 'Evaluación del estudiante por la empresa' },
];

export async function seedStudentDocuments(studentId: string, programType: ProgramType) {
  const template = programType === 'servicio_social' ? DOCS_SS : DOCS_RP;
  for (const doc of template) {
    const exists = await DocumentModel.findOne({ studentId, programType, category: doc.category });
    if (!exists) {
      await DocumentModel.create({ studentId, programType, ...doc, status: 'pending', observations: [] });
    }
  }
}

export async function getStudentDocuments(studentId: string, programType: ProgramType) {
  await seedStudentDocuments(studentId, programType);
  return DocumentModel.find({ studentId, programType }).sort({ createdAt: 1 });
}

export async function upsertDocument(data: {
  studentId:   string;
  programType: ProgramType;
  category:    string;
  description: string;
  fileName?:   string;
  filePath?:   string;
  fileSize?:   number;
}) {
  const existing = await DocumentModel.findOne({
    studentId:   data.studentId,
    programType: data.programType,
    category:    data.category,
  });

  if (existing) {
    if (existing.filePath && data.filePath) {
      try { fs.unlinkSync(path.resolve(existing.filePath)); } catch {}
    }
    existing.fileName = data.fileName;
    existing.filePath = data.filePath;
    existing.fileSize = data.fileSize;
    existing.status   = 'pending';
    return existing.save();
  }

  return DocumentModel.create({ ...data, status: 'pending', observations: [] });
}

export async function reviewDocument(
  docId: string, status: DocStatus, observation: string, reviewedBy: string
) {
  const doc = await DocumentModel.findById(docId);
  if (!doc) throw new Error('Documento no encontrado');
  doc.status     = status;
  doc.reviewedBy = reviewedBy;
  if (observation) doc.observations.push(observation);
  return doc.save();
}

export async function getAllStudentsProgress(programType: ProgramType) {
  return DocumentModel.aggregate([
    { $match: { programType } },
    { $group: {
        _id:      '$studentId',
        total:    { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ['$status','approved'] }, 1, 0] } },
        pending:  { $sum: { $cond: [{ $eq: ['$status','pending']  }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status','rejected'] }, 1, 0] } },
    }},
  ]);
}