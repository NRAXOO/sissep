import { Request, Response } from 'express';
import * as DocService       from '../services/document.service';
import { ok, fail }          from '../utils/response';
import { ProgramType }       from '../types';

export async function listMyDocs(req: Request, res: Response) {
  try {
    const { programType = 'servicio_social' } = req.query;
    const docs = await DocService.getStudentDocuments(req.user!.userId, programType as ProgramType);
    return ok(res, docs);
  } catch (e: any) {
    return fail(res, e.message);
  }
}

export async function uploadDocument(req: Request, res: Response) {
  try {
    const { category, description, programType = 'servicio_social' } = req.body;
    if (!category) return fail(res, 'category es requerido');
    if (!req.file)  return fail(res, 'Archivo requerido');

    const doc = await DocService.upsertDocument({
      studentId:   req.user!.userId,
      programType: programType as ProgramType,
      category,
      description: description || '',
      fileName:    req.file.originalname,
      filePath:    req.file.path,
      fileSize:    req.file.size,
    });
    return ok(res, doc, 201);
  } catch (e: any) {
    return fail(res, e.message);
  }
}

export async function reviewDocument(req: Request, res: Response) {
  try {
    const { docId }    = req.params;
    const { status, observation } = req.body;
    if (!['approved','rejected'].includes(status))
      return fail(res, 'status debe ser approved o rejected');

    const doc = await DocService.reviewDocument(docId, status, observation || '', req.user!.userId);
    return ok(res, doc);
  } catch (e: any) {
    return fail(res, e.message);
  }
}

export async function studentsProgress(req: Request, res: Response) {
  try {
    const { programType = 'servicio_social' } = req.query;
    const data = await DocService.getAllStudentsProgress(programType as ProgramType);
    return ok(res, data);
  } catch (e: any) {
    return fail(res, e.message);
  }
}
