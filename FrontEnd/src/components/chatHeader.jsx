import React from 'react';

export default function ChatHeader({ selectedAI, setSelectedAI, selectedPrompt, setSelectedPrompt }) {
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
                        <option value="gemini">Gemini 3.1 Pro</option>
                        <option value="openai">OpenAI (GPT-4)</option>
                        <option value="claude">Claude 3</option>
                        <option value="deepseek">DeepSeek</option>
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
                        <option value="qualidade_alta">Teste: Media Qualidade</option>
                        <option value="qualidade_alta">Teste: Baixa Qualidade</option>
                        <option value="sem_info">Teste: Sem Informaação</option>
                    </select>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Sistema Online</span>
            </div>
        </div>
    );
}