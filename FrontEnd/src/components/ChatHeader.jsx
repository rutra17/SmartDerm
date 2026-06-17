import React, { useEffect } from 'react';

function ChatHeader({ selectedAI, setSelectedAI, selectedPrompt, setSelectedPrompt }) {
    
    // Lista de Prompts estática (Substitui a antiga chamada ao Supabase)
    const listaPrompts = [
        { titulo: 'Padrão Atual', chave_identificadora: 'padrao' },
        { titulo: 'Triagem Severa (Urgências)', chave_identificadora: 'urgencia' },
        { titulo: 'Análise Altamente Detalhada', chave_identificadora: 'detalhado' }
    ];

    // Garante que o prompt 'padrao' é selecionado caso não haja nenhum definido
    useEffect(() => {
        if (!selectedPrompt) {
            setSelectedPrompt('padrao');
        }
    }, [selectedPrompt, setSelectedPrompt]);

    return (
        <div className="w-full bg-[#202123] border-b border-white/10 p-4 flex flex-wrap justify-between items-center gap-4 shadow-md">
            <div className="flex items-center gap-2">
                <span className="text-xl">🏥</span>
                <h1 className="text-lg font-bold text-white">SmartDerm AI</h1>
            </div>

            {/* Controles de Configuração da IA */}
            <div className="flex items-center gap-4">
                
                {/* Seletor de Modelo de IA */}
                <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-400 font-semibold uppercase">Modelo:</label>
                    <select 
                        value={selectedAI} 
                        onChange={(e) => setSelectedAI(e.target.value)}
                        className="bg-[#343541] border border-gray-600 rounded p-1.5 text-sm text-white focus:outline-none focus:border-purple-500 font-medium"
                    >
                        <option value="gemini">Gemini 2.5 Flash</option>
                        <option value="openai">ChatGPT 4o</option>
                        <option value="deepseek">DeepSeek R1</option>
                        <option value="simulacao">⚠️ Modo Simulação</option>
                    </select>
                </div>

                {/* Seletor Dinâmico de Prompts */}
                <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-400 font-semibold uppercase">Prompt:</label>
                    <select 
                        value={selectedPrompt} 
                        onChange={(e) => setSelectedPrompt(e.target.value)}
                        className="bg-[#343541] border border-gray-600 rounded p-1.5 text-sm text-white focus:outline-none focus:border-purple-500 font-medium max-w-[200px]"
                    >
                        {listaPrompts.map(p => (
                            <option key={p.chave_identificadora} value={p.chave_identificadora}>
                                {p.titulo}
                            </option>
                        ))}
                    </select>
                </div>

            </div>
        </div>
    );
}

export default ChatHeader;