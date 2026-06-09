import express from 'express';
import { listarPrompts, criarPrompt, atualizarPrompt, excluirPrompt } from '../controllers/promptsController.js';
import { autenticar, autorizar } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', autenticar, listarPrompts);
router.post('/', autenticar, autorizar('cientista'), criarPrompt);
router.put('/:id', autenticar, autorizar('cientista'), atualizarPrompt);
router.delete('/:id', autenticar, autorizar('cientista'), excluirPrompt);

export default router;
