import pool from '../services/database.js';

export const listarPrompts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM engenharia_prompts ORDER BY created_at DESC');
        return res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar prompts:', error);
        return res.status(500).json({ error: 'Erro interno.' });
    }
};

export const criarPrompt = async (req, res) => {
    const { titulo, chave_identificadora, comando_base } = req.body;

    if (!titulo || !chave_identificadora || !comando_base) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO engenharia_prompts (titulo, chave_identificadora, comando_base)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [titulo, chave_identificadora.toLowerCase().replace(/\s/g, '_'), comando_base]
        );
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Chave identificadora já existe.' });
        }
        console.error('Erro ao criar prompt:', error);
        return res.status(500).json({ error: 'Erro interno.' });
    }
};

export const atualizarPrompt = async (req, res) => {
    const { id } = req.params;
    const { titulo, comando_base } = req.body;

    try {
        const result = await pool.query(
            `UPDATE engenharia_prompts
             SET titulo = COALESCE($1, titulo),
                 comando_base = COALESCE($2, comando_base)
             WHERE id = $3
             RETURNING *`,
            [titulo || null, comando_base || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Prompt não encontrado.' });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar prompt:', error);
        return res.status(500).json({ error: 'Erro interno.' });
    }
};

export const excluirPrompt = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM engenharia_prompts WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Prompt não encontrado.' });
        }

        return res.json({ message: 'Prompt removido com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir prompt:', error);
        return res.status(500).json({ error: 'Erro interno.' });
    }
};
