import pool from '../services/database.js';

export const listarConsultas = async (req, res) => {
    try {
        let result;
        if (req.usuario.tipo_conta === 'paciente') {
            result = await pool.query(
                'SELECT * FROM consultas WHERE paciente_id = $1 ORDER BY created_at DESC',
                [req.usuario.id]
            );
        } else {
            result = await pool.query('SELECT * FROM consultas ORDER BY created_at DESC');
        }
        return res.json(result.rows);
    } catch (error) {
        console.error('Erro ao listar consultas:', error);
        return res.status(500).json({ error: 'Erro interno.' });
    }
};

export const criarConsulta = async (req, res) => {
    const nome_paciente = req.body.nome_paciente || req.usuario.nome;

    try {
        const result = await pool.query(
            'INSERT INTO consultas (nome_paciente, paciente_id) VALUES ($1, $2) RETURNING *',
            [nome_paciente, req.usuario.id]
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
