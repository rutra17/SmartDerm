import express from 'express';
// import { autenticar } from '../middlewares/authMiddleware.js'; // Descomente para ativar segurança total depois
import { 
    obterResumoGeral, 
    listarTudo, 
    criarUsuario, 
    deletarEntidade 
} from '../controllers/adminController.js';

const router = express.Router();

// Nota: Num ambiente real, colocaríamos um router.use(verificarAdmin) aqui.
// Para este MVP, vamos deixar as rotas expostas para testarmos o Front-End facilmente.

router.get('/resumo', obterResumoGeral);
router.get('/listar-tudo', listarTudo);
router.post('/criar-usuario', criarUsuario);
router.delete('/deletar/:tipo/:id', deletarEntidade);

export default router;