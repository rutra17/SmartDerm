import React from 'react';

export default function ChatHeader({ selectedAI, setSelectedAI, selectedPrompt, setSelectedPrompt }) {
    // Verifica se o modo atual é o de simulação
    const isSimulation = selectedAI === 'simulacao';

    return (
        <div className="w-full bg-[#343541] border-b border-white/10 p-4 flex items-center justify-between text-sm text-gray-300 z-10 shadow-sm">
            <div className="flex gap-4">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-400">IA:</span>
                    <select 
                        value={selectedAI} 
                        onChange={(e) => setSelectedAI(e.target.value)}
                        className="bg-[#40414f] border border-white/10 rounded px-2 py-1 outline-none focus:border-emerald-500 transition"
                    >
                        <option value="gemini">Gemini 2.5 Flash</option>
                        <option value="openai">OpenAI (GPT-4)</option>
                        <option value="claude">Claude 3</option>
                        <option value="deepseek">DeepSeek</option>
                        {/* Nova opção de Simulação mantendo suas outras IAs */}
                        <option value="simulacao">Simulação (Modo Teste)</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-400">Prompt:</span>
                    <select 
                        value={selectedPrompt} 
                        onChange={(e) => setSelectedPrompt(e.target.value)}
                        className="bg-[#40414f] border border-white/10 rounded px-2 py-1 outline-none focus:border-emerald-500 transition"
                    >
                        <option value="padrao">Padrão Médico</option>
                        <option value="qualidade_alta">Teste: Alta Qualidade</option>
                        <option value="qualidade_media">Teste: Media Qualidade</option>
                        <option value="qualidade_baixo">Teste: Baixa Qualidade</option>
                        <option value="sem_info">Teste: Sem Informação</option>
                    </select>
                </div>
            </div>
            
            {/* Indicador de Status Dinâmico */}
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isSimulation ? 'bg-yellow-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                <span className={`text-xs uppercase tracking-wider ${isSimulation ? 'text-yellow-500 font-bold' : 'text-gray-400'}`}>
                    {isSimulation ? 'Modo Simulação' : 'Sistema Online'}
                </span>
            </div>
        </div>
    );
}