import { Router }         from 'express';
import * as Auth          from '../controllers/auth.controller';
import { authenticate }   from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', Auth.register);
router.post('/login',    Auth.login);
router.get( '/me',       authenticate, Auth.me);

export default router;
