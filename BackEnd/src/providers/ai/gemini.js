import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analisa uma imagem usando o Gemini 2.5 Flash.
 * @param {Buffer} imageBuffer
 * @param {string} mimeType
 * @param {string} promptFinal
 * @returns {Promise<string>}
 */
export async function analisarImagem(imageBuffer, mimeType, promptFinal) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const imageParts = [
            {
                inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType,
                },
            },
        ];

        const result = await model.generateContent([promptFinal, ...imageParts]);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('❌ Erro no provider Gemini:', error);
        throw error;
    }
}
