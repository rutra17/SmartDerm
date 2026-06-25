import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Inicializa o SDK do Google com a chave do seu arquivo .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analisarImagemComGemini = async (imageBuffer, mimeType, promptUsuario) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // O Gemini exige que a imagem seja convertida para Base64 antes de ser enviada para a API
        const imageParts = [
            {
                inlineData: {
                    data: imageBuffer.toString("base64"),
                    mimeType: mimeType
                }
            }
        ];

        console.log("🧠 Enviando imagem para o modelo Gemini...");
        
        // Dispara a requisição juntando o texto do prompt e a imagem
        const result = await model.generateContent([promptUsuario, ...imageParts]);
        const response = await result.response;
        
        return response.text();
    } catch (error) {
        console.error("❌ Erro na API do Gemini:", error);
        throw error;
    }
};