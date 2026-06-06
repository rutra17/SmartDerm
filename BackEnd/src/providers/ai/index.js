import { analisarImagem as gemini } from './gemini.js';
import { analisarImagem as openai } from './openai.js';
import { analisarImagem as claude } from './claude.js';
import { analisarImagem as deepseek } from './deepseek.js';

const providers = { gemini, openai, claude, deepseek };

/**
 * Retorna a função analisarImagem do provider correto.
 * @param {string} nomeModelo - 'gemini' | 'openai' | 'claude' | 'deepseek'
 * @returns {Function}
 */
export function getProviderIA(nomeModelo) {
    const provider = providers[nomeModelo];
    if (!provider) {
        console.warn(`⚠️ Provider '${nomeModelo}' não reconhecido. Usando 'gemini' como fallback.`);
        return providers.gemini;
    }
    return provider;
}
