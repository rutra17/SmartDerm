import pool from '../services/database.js';

export const getStats = async (req, res) => {
    try {
        const [consultasResult, mensagensResult] = await Promise.all([
            pool.query(`
                SELECT
                    COUNT(*)                                              AS total_consultas,
                    COUNT(*) FILTER (WHERE status = 'finalizada')        AS finalizadas,
                    COUNT(*) FILTER (WHERE status = 'pendente'
                                       OR status IS NULL)                AS pendentes
                FROM consultas
            `),
            pool.query(`
                SELECT
                    COUNT(*) FILTER (WHERE imagem_url IS NOT NULL)       AS total_imagens,
                    COUNT(*) FILTER (WHERE role = 'assistant'
                                     AND ia_utilizada IS NOT NULL)       AS total_ia,
                    ia_utilizada,
                    prompt_utilizado,
                    COUNT(*)                                              AS quantidade
                FROM mensagens
                WHERE role = 'assistant' AND ia_utilizada IS NOT NULL
                GROUP BY ia_utilizada, prompt_utilizado
            `),
        ]);

        const { total_consultas, finalizadas, pendentes } = consultasResult.rows[0];

        let total_imagens = 0;
        let total_ia = 0;
        const modelos_ia = {};
        const prompts_utilizados = {};

        for (const row of mensagensResult.rows) {
            total_imagens = parseInt(row.total_imagens) || total_imagens;
            total_ia += parseInt(row.quantidade);

            const modelo = row.ia_utilizada || 'Desconhecido';
            modelos_ia[modelo] = (modelos_ia[modelo] || 0) + parseInt(row.quantidade);

            const prompt = row.prompt_utilizado || 'Padrão';
            prompts_utilizados[prompt] = (prompts_utilizados[prompt] || 0) + parseInt(row.quantidade);
        }

        // total_imagens vem de todas as mensagens, não só as agrupadas — query separada
        const imagensResult = await pool.query(
            `SELECT COUNT(*) AS total FROM mensagens WHERE imagem_url IS NOT NULL`
        );

        return res.json({
            total_consultas: parseInt(total_consultas),
            status_consultas: {
                finalizada: parseInt(finalizadas),
                pendente: parseInt(pendentes),
            },
            total_ia,
            total_imagens: parseInt(imagensResult.rows[0].total),
            modelos_ia,
            prompts_utilizados,
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return res.status(500).json({ error: 'Erro interno.' });
    }
};
