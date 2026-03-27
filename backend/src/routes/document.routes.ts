import { Router }                    from 'express';
import * as Doc                      from '../controllers/document.controller';
import { authenticate, authorize }   from '../middlewares/auth.middleware';
import { upload }                    from '../middlewares/upload.middleware';

const router = Router();

// Estudiante – ver y subir sus propios documentos
router.get( '/',          authenticate, authorize('estudiante'), Doc.listMyDocs);
router.post('/upload',    authenticate, authorize('estudiante'), upload.single('file'), Doc.uploadDocument);

// Encargado – revisar documentos
router.patch('/:docId/review', authenticate, authorize('encargado'), Doc.reviewDocument);
router.get(  '/progress',      authenticate, authorize('encargado'), Doc.studentsProgress);

export default router;
