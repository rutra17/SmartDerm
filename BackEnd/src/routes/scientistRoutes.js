import express from 'express';
import { autenticar } from '../middlewares/authMiddleware.js';
import { verificarCientista, listarPrompts, criarPrompt, atualizarPrompt, deletarPrompt, obterEstatisticas, obterConsultasAuditoria } from '../controllers/scientistController.js';

const router = express.Router();

router.use(autenticar);
router.use(verificarCientista);

router.get('/cientista/estatisticas', obterEstatisticas);
router.get('/cientista/prompts', listarPrompts);
router.get('/cientista/auditoria', obterConsultasAuditoria);
router.post('/cientista/prompts', criarPrompt);
router.put('/cientista/prompts/:id', atualizarPrompt);
router.delete('/cientista/prompts/:id', deletarPrompt);

export default router;