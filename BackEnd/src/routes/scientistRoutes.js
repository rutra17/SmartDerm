import express from 'express';
import { autenticar } from '../middlewares/authMiddleware.js';
import { verificarCientista, listarPrompts, criarPrompt, atualizarPrompt, deletarPrompt, obterEstatisticas } from '../controllers/scientistController.js';

const router = express.Router();

router.use(autenticar);
router.use(verificarCientista); // Aplica a verificação de cargo a todas as rotas abaixo

router.get('/cientista/estatisticas', obterEstatisticas); // 🌟 ROTA DAS ESTATÍSTICAS AQUI
router.get('/cientista/prompts', listarPrompts);
router.post('/cientista/prompts', criarPrompt);
router.put('/cientista/prompts/:id', atualizarPrompt);
router.delete('/cientista/prompts/:id', deletarPrompt);

export default router;