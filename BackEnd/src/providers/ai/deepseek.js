import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// DeepSeek usa a mesma interface da OpenAI com baseURL diferente
const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
});

/**
 * Analisa uma imagem usando o DeepSeek Chat.
 * @param {Buffer} imageBuffer
 * @param {string} mimeType
 * @param {string} promptFinal
 * @returns {Promise<string>}
 */
export async function analisarImagem(imageBuffer, mimeType, promptFinal) {
    try {
        const base64 = imageBuffer.toString('base64');

        const response = await client.chat.completions.create({
            model: 'deepseek-chat',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: { url: `data:${mimeType};base64,${base64}` },
                        },
                        {
                            type: 'text',
                            text: promptFinal,
                        },
                    ],
                },
            ],
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('❌ Erro no provider DeepSeek:', error);
        throw error;
    }
}
