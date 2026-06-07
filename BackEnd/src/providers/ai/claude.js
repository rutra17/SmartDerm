import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Analisa uma imagem usando o Claude Opus 4.5.
 * @param {Buffer} imageBuffer
 * @param {string} mimeType
 * @param {string} promptFinal
 * @returns {Promise<string>}
 */
export async function analisarImagem(imageBuffer, mimeType, promptFinal) {
    try {
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const base64 = imageBuffer.toString('base64');

        const response = await client.messages.create({
            model: 'claude-opus-4-5',
            max_tokens: 4096,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: mimeType,
                                data: base64,
                            },
                        },
                        {
                            type: 'text',
                            text: promptFinal,
                        },
                    ],
                },
            ],
        });

        return response.content[0].text;
    } catch (error) {
        console.error('❌ Erro no provider Claude:', error);
        throw error;
    }
}
