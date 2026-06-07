import express from 'express';
import { listarMensagens, criarMensagem } from '../controllers/mensagensController.js';

const router = express.Router();

router.get('/', listarMensagens);
router.post('/', criarMensagem);

export default router;
