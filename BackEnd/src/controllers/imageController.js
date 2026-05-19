import { analisarImagemComGemini } from '../services/geminiService.js';

// Adicionamos o 'async' aqui porque agora vamos esperar a IA pensar
export const uploadImage = async (req, res) => { 
    // 1. Verifica se algum arquivo chegou
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
    }

    try {
        const fileInfo = {
            nome: req.file.originalname,
            tipo: req.file.mimetype,
            tamanho: `${(req.file.size / 1024).toFixed(2)} KB`
        };

        console.log("📸 Imagem recebida no servidor:", fileInfo.nome);

        // 2. Define o prompt que a IA vai seguir
        const promptPadrao = "Você é um assistente especializado em dermatologia. Analise esta imagem de uma lesão na pele e descreva as características visíveis (Assimetria, Bordas, Cor e Diâmetro). Termine a mensagem lembrando que isso é apenas uma triagem e o paciente deve consultar um médico.";

        // 3. Envia a imagem (que está na memória RAM/buffer) para o serviço do Gemini
        // Isso pode demorar alguns segundos, por isso usamos o 'await'
        const textoDaIA = await analisarImagemComGemini(
            req.file.buffer, 
            req.file.mimetype, 
            promptPadrao
        );

        console.log("✅ Análise do Gemini concluída com sucesso!");

        // 4. Retorna a resposta final e real para o Front-End
        res.status(200).json({
            message: 'Análise concluída!',
            detalhes: fileInfo,
            resultadoIA: textoDaIA // A mágica acontece aqui: enviamos o texto gerado de volta
        });

    } catch (error) {
        console.error("❌ Erro interno ao analisar a imagem:", error);
        res.status(500).json({ error: 'Ocorreu um erro ao processar a imagem na IA.' });
    }
};