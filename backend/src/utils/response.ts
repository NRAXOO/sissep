import { Response }       from 'express';
import { ApiResponse }    from '../types';

export function ok<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({ ok: true, data } as ApiResponse<T>);
}

export function fail(res: Response, message: string, status = 400, errors?: string[]) {
  return res.status(status).json({ ok: false, message, errors } as ApiResponse);
}
