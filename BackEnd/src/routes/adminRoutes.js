import express from 'express';
import { obterResumoGeral, listarTudo, criarUsuario, deletarEntidade, criarAdminMaster } from '../controllers/adminController.js';
import { autenticar, verificarAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/resumo', autenticar, verificarAdmin, obterResumoGeral);
router.get('/listar-tudo', autenticar, verificarAdmin, listarTudo);
router.post('/criar-usuario', autenticar, verificarAdmin, criarUsuario);
router.delete('/deletar/:tipo/:id', autenticar, verificarAdmin, deletarEntidade);

export default router;