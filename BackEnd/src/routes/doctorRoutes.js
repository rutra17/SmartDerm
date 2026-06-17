import express from 'express';
import { autenticar } from '../middlewares/authMiddleware.js';
import { listarFilaConsultas, detalhesConsulta, salvarLaudo } from '../controllers/doctorController.js';

const router = express.Router();

// Aplica o porteiro de segurança (Token JWT)
router.use(autenticar);

// Caminhos da API para o Painel do Médico
router.get('/medico/consultas', listarFilaConsultas);
router.get('/medico/consultas/:id', detalhesConsulta);
router.post('/medico/consultas/:id/laudo', salvarLaudo);

export default router;