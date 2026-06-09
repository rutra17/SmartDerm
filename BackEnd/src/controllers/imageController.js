import pool from '../services/database.js';
import { getProviderIA } from '../providers/ai/index.js';
import { uploadImagem, gerarNomeArquivo } from '../providers/storage/index.js';

export const uploadImage = async (req, res) => {
    console.log("1. 🚀 Requisição chegou ao Controlador!");

    if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada ou nome do campo incorreto.' });
    }

    try {
        const { userText, aiModel, promptKey, consultaId } = req.body;
        console.log("2. 📥 Ingredientes recebidos:", { userText, aiModel, promptKey, consultaId });

        console.log("3. 📤 A fazer upload da imagem para o MinIO...");
        const nomeArquivo = gerarNomeArquivo(req.file.mimetype);
        const imagemUrl = await uploadImagem(req.file.buffer, req.file.mimetype, nomeArquivo);
        console.log("4. ✅ Upload concluído! URL:", imagemUrl);

        // Salva a mensagem do usuário no banco
        if (consultaId) {
            const textoUsuario = userText && userText.trim() ? userText.trim() : "Imagem enviada para triagem.";
            await pool.query(
                `INSERT INTO mensagens (consulta_id, role, texto, imagem_url)
                 VALUES ($1, 'user', $2, $3)`,
                [consultaId, textoUsuario, imagemUrl]
            );
        }

        console.log("5. 🔍 A procurar prompt base no banco...");
        const promptResult = await pool.query(
            'SELECT comando_base FROM engenharia_prompts WHERE chave_identificadora = $1',
            [promptKey || 'padrao']
        );

        const instrucaoBase = promptResult.rows[0]
            ? promptResult.rows[0].comando_base
            : "Aja como um dermatologista. Analise a imagem.";

        let promptFinal = `${instrucaoBase}\n\n`;
        if (userText && userText.trim()) {
            promptFinal += `RELATO DO PACIENTE:\n"${userText.trim()}"\n\n`;
        } else {
            promptFinal += `INFORMAÇÃO ADICIONAL:\nO paciente não forneceu detalhes textuais, analise apenas a imagem.\n\n`;
        }
        promptFinal += `Com base nas instruções acima e no relato, forneça a avaliação técnica da imagem.`;

        console.log("6. 🧠 A enviar para a IA:", aiModel || 'gemini');
        const analisarImagem = getProviderIA(aiModel);
        const textoDaIA = await analisarImagem(req.file.buffer, req.file.mimetype, promptFinal);
        console.log("7. ✅ Laudo gerado!");

        if (consultaId) {
            await pool.query(
                `INSERT INTO mensagens (consulta_id, role, texto, ia_utilizada, prompt_utilizado)
                 VALUES ($1, 'assistant', $2, $3, $4)`,
                [consultaId, textoDaIA, aiModel || 'gemini', promptKey || 'padrao']
            );
        }

        return res.status(200).json({ resultadoIA: textoDaIA, imagemUrl });

    } catch (error) {
        console.error("❌ ERRO FATAL:", error);
        return res.status(500).json({ error: 'Erro interno ao processar a IA.' });
    }
};
