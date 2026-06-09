import { analisarImagemComGemini } from '../../services/geminiService.js';

const provedorSimulacao = async () => {
    return '**[MODO SIMULAÇÃO]** Esta é uma resposta simulada. Configure uma chave de API válida para obter análises reais.';
};

export const getProviderIA = (aiModel) => {
    switch (aiModel) {
        case 'gemini':
            return analisarImagemComGemini;
        case 'simulacao':
            return provedorSimulacao;
        default:
            return analisarImagemComGemini;
    }
};
