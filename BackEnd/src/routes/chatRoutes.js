import express from 'express';
import multer from 'multer';
import { autenticar } from '../middlewares/authMiddleware.js'; // A SUA função!
import { criarConsulta, listarConsultas, listarMensagens, enviarMensagem } from '../controllers/chatController.js';

const router = express.Router();

// Configura o Multer na memória da RAM
const upload = multer({ storage: multer.memoryStorage() });

// Aplica a sua segurança a todas as rotas de chat
router.use(autenticar);

// Rotas
router.post('/consultas', criarConsulta);
router.get('/consultas', listarConsultas);
router.get('/consultas/:id/mensagens', listarMensagens);
router.post('/chat/enviar', upload.single('imagem'), enviarMensagem);

export default router;