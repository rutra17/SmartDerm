import pool from '../services/database.js';

export const listarConsultas = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM consultas ORDER BY created_at DESC');
        return res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar consultas:', error);
        return res.status(500).json({ error: 'Erro interno.' });
    }
};

export const criarConsulta = async (req, res) => {
    const { nome_paciente } = req.body;

    if (!nome_paciente) {
        return res.status(400).json({ error: 'Nome do paciente obrigatório.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO consultas (nome_paciente) VALUES ($1) RETURNING *',
            [nome_paciente]
        );
        return res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar consulta:', error);
        return res.status(500).json({ error: 'Erro interno.' });
    }
};

export const atualizarConsulta = async (req, res) => {
    const { id } = req.params;
    const { laudo_medico, status } = req.body;

    try {
        const result = await pool.query(
            `UPDATE consultas
             SET laudo_medico = COALESCE($1, laudo_medico),
                 status = COALESCE($2, status),
                 updated_at = NOW()
             WHERE id = $3
             RETURNING *`,
            [laudo_medico || null, status || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Consulta não encontrada.' });
        }

        return res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar consulta:', error);
        return res.status(500).json({ error: 'Erro interno.' });
    }
};
