import express from 'express';
import { getStats } from '../controllers/statsController.js';
import { autenticar, autorizar } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', autenticar, autorizar('cientista'), getStats);

export default router;
