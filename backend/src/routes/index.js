import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import studentRoutes from './studentRoutes.js';
import authRoutes from './authRoutes.js';

const apiRouter = Router();

apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/students', studentRoutes);

export default apiRouter;
