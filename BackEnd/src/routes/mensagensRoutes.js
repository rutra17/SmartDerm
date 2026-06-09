import express from 'express';
import { listarMensagens, criarMensagem } from '../controllers/mensagensController.js';
import { autenticar } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', autenticar, listarMensagens);
router.post('/', autenticar, criarMensagem);

export default router;
