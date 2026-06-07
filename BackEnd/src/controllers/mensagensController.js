import pool from '../services/database.js';

export const listarMensagens = async (req, res) => {
    const { consulta_id } = req.query;

    if (!consulta_id) {
        return res.status(400).json({ error: 'consulta_id obrigatório.' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM mensagens WHERE consulta_id = $1 ORDER BY created_at ASC',
            [consulta_id]
        );
        return res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar mensagens:', error);
        return res.status(500).json({ error: 'Erro interno.' });
    }
};

export const criarMensagem = async (req, res) => {
    const { consulta_id, role, texto, imagem_url, ia_utilizada, prompt_utilizado } = req.body;

    if (!consulta_id || !role || !texto) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO mensagens (consulta_id, role, texto, imagem_url, ia_utilizada, prompt_utilizado)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [consulta_id, role, texto, imagem_url || null, ia_utilizada || null, prompt_utilizado || null]
        );
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar mensagem:', error);
        return res.status(500).json({ error: 'Erro interno.' });
    }
};
