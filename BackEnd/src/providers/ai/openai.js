import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analisa uma imagem usando o GPT-4o.
 * @param {Buffer} imageBuffer
 * @param {string} mimeType
 * @param {string} promptFinal
 * @returns {Promise<string>}
 */
export async function analisarImagem(imageBuffer, mimeType, promptFinal) {
    try {
        const base64 = imageBuffer.toString('base64');

        const response = await client.chat.completions.create({
            model: 'gpt-4o',
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
        console.error('❌ Erro no provider OpenAI:', error);
        throw error;
    }
}
