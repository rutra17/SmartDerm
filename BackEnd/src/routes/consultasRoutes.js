import express from 'express';
import { listarConsultas, criarConsulta, atualizarConsulta } from '../controllers/consultasController.js';
import { autenticar, autorizar } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', autenticar, listarConsultas);
router.post('/', autenticar, autorizar('paciente'), criarConsulta);
router.put('/:id', autenticar, autorizar('medico', 'cientista'), atualizarConsulta);

export default router;
