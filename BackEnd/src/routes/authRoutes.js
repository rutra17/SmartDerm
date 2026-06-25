import express from 'express';
import { login, registrar, logout, registrarPorConvite} from '../controllers/authController.js'; // Adicionamos o 'registar' aqui
import { autenticar } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/registrar', registrar);
router.post('/logout', autenticar, logout);
router.post('/registrar-convite', registrarPorConvite);

export default router;