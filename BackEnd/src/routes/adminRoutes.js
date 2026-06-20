import express from 'express';
import { obterResumoGeral, listarTudo, criarUsuario, deletarEntidade, criarAdminMaster } from '../controllers/adminController.js';
import { autenticar } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas do Administrador livres de barreiras para testes iniciais
router.get('/resumo', obterResumoGeral);
router.get('/listar-tudo', listarTudo);
router.post('/setup', criarAdminMaster); 
router.post('/criar-usuario', criarUsuario);
router.delete('/deletar/:tipo/:id', deletarEntidade);

export default router;