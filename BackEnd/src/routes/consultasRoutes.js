import express from 'express';
import { listarConsultas, criarConsulta, atualizarConsulta } from '../controllers/consultasController.js';

const router = express.Router();

router.get('/', listarConsultas);
router.post('/', criarConsulta);
router.put('/:id', atualizarConsulta);

export default router;
