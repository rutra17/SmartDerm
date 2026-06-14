import express from 'express';
import pool from '../services/database.js';
import { autenticar, autorizar } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET - Busca todos os códigos (Apenas Cientista/Admin)
router.get('/admin/convites', autenticar, autorizar('cientista'), async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM codigos_convite ORDER BY criado_em DESC");
        return res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar convites:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// POST - Gera um novo código
router.post('/admin/convites', autenticar, autorizar('cientista'), async (req, res) => {
    const { codigo, identificacao, status } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO codigos_convite (codigo, identificacao, status) VALUES ($1, $2, $3) RETURNING *",
            [codigo, identificacao, status || 'Ativo']
        );
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar convite:', error);
        return res.status(500).json({ error: 'Erro interno ao gerar código.' });
    }
});

// DELETE - Revogar um código
router.delete('/admin/convites/:id', autenticar, autorizar('cientista'), async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("DELETE FROM codigos_convite WHERE id = $1", [id]);
        return res.json({ message: 'Convite revogado com sucesso.' });
    } catch (error) {
        console.error('Erro ao revogar convite:', error);
        return res.status(500).json({ error: 'Erro ao revogar.' });
    }
});

export default router;
