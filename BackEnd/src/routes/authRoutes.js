import express from 'express';
import { login, registrar } from '../controllers/authController.js'; // Adicionamos o 'registar' aqui

const router = express.Router();

router.post('/login', login);
router.post('/registrar', registrar); // Nova rota exposta

export default router;