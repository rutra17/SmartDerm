import React, { useState, useEffect } from 'react';

function ChatHeader({ selectedAI, setSelectedAI, selectedPrompt, setSelectedPrompt }) {
    const [listaPrompts, setListaPrompts] = useState([]);

    useEffect(() => {
        carregarPrompts();
    }, []);

    const carregarPrompts = async () => {
        try {
            const resposta = await fetch('https://api.smartderm.37.27.81.229.sslip.io/api/prompts', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (resposta.ok) {
                const data = await resposta.json();
                setListaPrompts(data);
                
                // Se a lista carregar mas o selectedPrompt atual não estiver nela (ex: primeiro carregamento),
                // selecionamos automaticamente a primeira opção do banco.
                if (data.length > 0 && !data.find(p => p.chave === selectedPrompt)) {
                    setSelectedPrompt(data[0].chave);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar prompts dinâmicos:", error);
            // Fallback de emergência caso a API falhe
            setListaPrompts([{ titulo: 'Padrão (Fallback)', chave: 'padrao' }]);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 bg-[#343541] border-b border-gray-600/50 shadow-sm gap-4 z-10">
            
            <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <h1 className="text-gray-200 font-semibold text-lg">SmartDerm IA</h1>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
                {/* Select do Modelo de IA */}
                <select
                    value={selectedAI}
                    onChange={(e) => setSelectedAI(e.target.value)}
                    className="flex-1 sm:flex-none bg-[#444654] border border-gray-600 text-gray-200 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 shadow-sm transition hover:bg-[#4b4d5c]"
                >
                    <option value="gemini">Gemini 2.5 Flash</option>
                    <option value="openai" disabled>GPT-4o (Em breve)</option>
                    <option value="deepseek" disabled>DeepSeek (Em breve)</option>
                </select>

                {/* Select Dinâmico do Prompt */}
                <select
                    value={selectedPrompt}
                    onChange={(e) => setSelectedPrompt(e.target.value)}
                    className="flex-1 sm:flex-none bg-[#444654] border border-purple-500/50 text-gray-200 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2 shadow-sm transition hover:bg-[#4b4d5c]"
                >
                    {listaPrompts.length === 0 ? (
                        <option value="padrao">A carregar...</option>
                    ) : (
                        listaPrompts.map(prompt => (
                            <option key={prompt.chave} value={prompt.chave}>
                                {prompt.titulo}
                            </option>
                        ))
                    )}
                </select>
            </div>
            
        </div>
    );
}

export default ChatHeader;