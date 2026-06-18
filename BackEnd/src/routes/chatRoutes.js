import express from 'express';
import multer from 'multer';
import { autenticar } from '../middlewares/authMiddleware.js';
import { criarConsulta, listarConsultas, listarMensagens, enviarMensagem, listarMedicos, listarPromptsAtivos } from '../controllers/chatController.js';


const router = express.Router();

// Configura o Multer na memória da RAM
const upload = multer({ storage: multer.memoryStorage() });
// Aplica a sua segurança a todas as rotas de chat
router.use(autenticar);
// Rotas
router.get('/medicos', listarMedicos);
router.get('/consultas', listarConsultas);
router.get('/consultas/:id/mensagens', listarMensagens);
router.get('/medicos', listarMedicos);
router.get('/prompts', listarPromptsAtivos);
router.post('/consultas', criarConsulta);
router.post('/chat/enviar', upload.single('imagem'), enviarMensagem);

export default router;