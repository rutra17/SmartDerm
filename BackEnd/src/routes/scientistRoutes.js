import express from 'express';
import { autenticar } from '../middlewares/authMiddleware.js';
import { verificarCientista, listarPrompts, criarPrompt, atualizarPrompt, deletarPrompt, obterEstatisticas, obterConsultasAuditoria } from '../controllers/scientistController.js';

const router = express.Router();


router.get('/cientista/estatisticas', autenticar, verificarCientista, obterEstatisticas);
router.get('/cientista/prompts', autenticar, verificarCientista, listarPrompts);
router.get('/cientista/auditoria', autenticar, verificarCientista, obterConsultasAuditoria);
router.post('/cientista/prompts', autenticar, verificarCientista, criarPrompt);
router.put('/cientista/prompts/:id', autenticar, verificarCientista, atualizarPrompt);
router.delete('/cientista/prompts/:id', autenticar, verificarCientista, deletarPrompt);

export default router;