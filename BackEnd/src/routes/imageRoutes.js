import express from 'express';
import { uploadMiddleware } from '../middlewares/upload.js';
import { uploadImage } from '../controllers/imageController.js';

const router = express.Router();

// Cria a rota POST em /api/upload
// 1º Ele passa pelo uploadMiddleware (pega o arquivo)
// 2º Ele passa pro uploadImage (gera a resposta)
router.post('/upload', uploadMiddleware, uploadImage);

export default router;