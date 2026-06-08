import express from 'express';
import { listarPrompts, criarPrompt, atualizarPrompt, excluirPrompt } from '../controllers/promptsController.js';

const router = express.Router();

router.get('/', listarPrompts);
router.post('/', criarPrompt);
router.put('/:id', atualizarPrompt);
router.delete('/:id', excluirPrompt);

export default router;
