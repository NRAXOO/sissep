import { Router }   from 'express';
import authRoutes   from './auth.routes';
import docRoutes    from './document.routes';

const router = Router();

router.use('/auth',      authRoutes);
router.use('/documents', docRoutes);

export default router;
