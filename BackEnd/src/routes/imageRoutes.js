import express from 'express';
import { uploadMiddleware } from '../middlewares/upload.js';
import { uploadImage } from '../controllers/imageController.js';
import { autenticar, autorizar } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/upload', autenticar, autorizar('paciente'), uploadMiddleware, uploadImage);

export default router;