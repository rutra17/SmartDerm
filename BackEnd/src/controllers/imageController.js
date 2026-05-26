import { supabase } from '../services/supabase.js';
import { analisarImagemComGemini } from '../services/geminiService.js';

export const uploadImage = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada.' });

    try {
        // 1. RECEBER OS INGREDIENTES DO FRONT-END
        const { userText, aiModel, promptKey, consultaId } = req.body;

        console.log("📥 Ingredientes recebidos:", { userText, aiModel, promptKey, consultaId });

        // 2. O PÃO DE CIMA: Buscar a regra do Cientista no Supabase
        const { data: promptData } = await supabase
            .from('engenharia_prompts')
            .select('comando_base')
            .eq('chave_identificadora', promptKey || 'padrao')
            .single();

        const instrucaoBase = promptData ? promptData.comando_base : "Aja como um dermatologista. Analise a imagem.";

        // 3. O RECHEIO: Montar o Sanduíche com o relato do Paciente
        let promptFinal = `${instrucaoBase}\n\n`;

        if (userText && userText.trim() !== "") {
            promptFinal += `RELATO DO PACIENTE:\n"${userText.trim()}"\n\n`;
        } else {
            promptFinal += `INFORMAÇÃO ADICIONAL:\nO paciente não forneceu detalhes textuais, analise apenas a imagem.\n\n`;
        }

        promptFinal += `Com base nas instruções acima e no relato, forneça a avaliação técnica da imagem.`;

        // 4. ASSAR O SANDUÍCHE: Enviar tudo para o Gemini
        const textoDaIA = await analisarImagemComGemini(
            req.file.buffer,
            req.file.mimetype,
            promptFinal
        );

        // 5. GUARDAR NO PRONTUÁRIO: Salvar a resposta no Supabase
        if (consultaId) {
            await supabase.from('mensagens').insert([{
                consulta_id: consultaId,
                role: 'assistant',
                texto: textoDaIA,
                ia_utilizada: aiModel || 'gemini',
                prompt_utilizado: promptKey || 'padrao'
            }]);
        }

        // 6. ENTREGAR AO PACIENTE
        res.status(200).json({ resultadoIA: textoDaIA });

    } catch (error) {
        console.error("❌ Erro na montagem do Sanduíche de Dados:", error);
        res.status(500).json({ error: 'Erro interno ao processar a IA.' });
    }
};
