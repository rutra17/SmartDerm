import { supabase } from '../services/supabase.js';
import { getProviderIA } from '../providers/ai/index.js';
import { uploadImagem, gerarNomeArquivo } from '../providers/storage/index.js';
import { criarMensagem } from '../models/mensagemModel.js';

export const uploadImage = async (req, res) => {
    console.log("1. 🚀 Requisição chegou ao Controlador!");

    if (!req.file) {
        console.error("❌ ERRO: Nenhuma imagem encontrada. O Front-End enviou o campo como 'imagem'?");
        return res.status(400).json({ error: 'Nenhuma imagem enviada ou nome do campo incorreto.' });
    }

    console.log("2. 📦 Imagem capturada na memória!");

    try {
        const { userText, aiModel, promptKey, consultaId } = req.body;
        console.log("3. 📥 Ingredientes recebidos:", { userText, aiModel, promptKey, consultaId });

        // Faz upload da imagem para o MinIO antes de chamar a IA
        console.log("3.5. 📤 A fazer upload da imagem para o MinIO...");
        const nomeArquivo = gerarNomeArquivo(req.file.mimetype);
        const imagemUrl = await uploadImagem(req.file.buffer, req.file.mimetype, nomeArquivo);
        console.log("3.6. ✅ Upload concluído! URL:", imagemUrl);

        console.log("4. 🔍 A procurar prompt base no banco de dados...");
        const { data: promptData, error: promptError } = await supabase
            .from('engenharia_prompts')
            .select('comando_base')
            .eq('chave_identificadora', promptKey || 'padrao')
            .single();

        if (promptError && promptError.code !== 'PGRST116') {
            console.error("⚠️ Aviso Supabase (Prompt):", promptError.message);
        }

        const instrucaoBase = promptData ? promptData.comando_base : "Aja como um dermatologista. Analise a imagem.";

        console.log("5. 🥪 A montar o Sanduíche de Dados (Prompt Final)...");
        let promptFinal = `${instrucaoBase}\n\n`;

        if (userText && userText.trim() !== "") {
            promptFinal += `RELATO DO PACIENTE:\n"${userText.trim()}"\n\n`;
        } else {
            promptFinal += `INFORMAÇÃO ADICIONAL:\nO paciente não forneceu detalhes textuais, analise apenas a imagem.\n\n`;
        }
        promptFinal += `Com base nas instruções acima e no relato, forneça a avaliação técnica da imagem.`;

        console.log("6. 🧠 A enviar para a IA selecionada:", aiModel || 'gemini');
        const analisarImagem = getProviderIA(aiModel);
        const textoDaIA = await analisarImagem(req.file.buffer, req.file.mimetype, promptFinal);
        console.log("7. ✅ Laudo gerado com sucesso!");

        if (consultaId) {
            console.log("8. 💾 A guardar a resposta na tabela 'mensagens'...");

            const mensagem = criarMensagem({
                consulta_id: consultaId,
                role: 'assistant',
                texto: textoDaIA,
                ia_utilizada: aiModel || 'gemini',
                prompt_utilizado: promptKey || 'padrao',
                imagem_url: imagemUrl,
            });

            const { error: insertError } = await supabase.from('mensagens').insert([mensagem]);

            if (insertError) console.error("⚠️ Erro ao salvar mensagem no banco:", insertError.message);
        }

        console.log("9. 🏁 A enviar resposta final para o Front-End!");
        return res.status(200).json({ resultadoIA: textoDaIA, imagemUrl });

    } catch (error) {
        console.error("❌ ERRO FATAL no processo da IA:", error);
        return res.status(500).json({ error: 'Erro interno ao processar a IA.' });
    }
};
