import express from 'express';
import { obterResumoGeral, listarTudo, criarUsuario, deletarEntidade, criarAdminMaster } from '../controllers/adminController.js';
import { autenticar, verificarAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 1. Rota de emergência/setup (Deixamos livre para o Thunder Client, caso precise)
router.post('/setup', criarAdminMaster); 

// 2. Rotas PROTEGIDAS: O utilizador tem de ter Token (autenticar) E ser Admin (verificarAdmin)
router.get('/resumo', autenticar, verificarAdmin, obterResumoGeral);
router.get('/listar-tudo', autenticar, verificarAdmin, listarTudo);
router.post('/criar-usuario', autenticar, verificarAdmin, criarUsuario);
router.delete('/deletar/:tipo/:id', autenticar, verificarAdmin, deletarEntidade);

export default router;