import { Request, Response } from 'express';
import * as AuthService      from '../services/auth.service';
import { ok, fail }          from '../utils/response';

export async function register(req: Request, res: Response) {
  try {
    const result = await AuthService.registerUser(req.body);
    return ok(res, result, 201);
  } catch (e: any) {
    return fail(res, e.message);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { controlNumber, password } = req.body;
    if (!controlNumber || !password)
      return fail(res, 'controlNumber y password son requeridos');
    const result = await AuthService.loginUser(controlNumber, password);
    return ok(res, result);
  } catch (e: any) {
    return fail(res, e.message, 401);
  }
}

export async function me(req: Request, res: Response) {
  return ok(res, req.user);
}
