import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

function ChatHeader({ selectedAI, setSelectedAI, selectedPrompt, setSelectedPrompt }) {
    const [listaPrompts, setListaPrompts] = useState([]);

    // Carrega os prompts reais do banco de dados ao iniciar o chat
    useEffect(() => {
        const obterPromptsDoBanco = async () => {
            const { data } = await supabase
                .from('engenharia_prompts')
                .select('titulo, chave_identificadora');
            
            if (data) {
                setListaPrompts(data);
                // Define o prompt padrão como selecionado inicialmente
                if (!selectedPrompt) {
                    setSelectedPrompt('padrao');
                }
            }
        };
        obterPromptsDoBanco();
    }, []);

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
                        {listaPrompts.length === 0 ? (
                            <option value="padrao">Padrão Atual</option>
                        ) : (
                            listaPrompts.map(p => (
                                <option key={p.chave_identificadora} value={p.chave_identificadora}>
                                    {p.titulo}
                                </option>
                            ))
                        )}
                    </select>
                </div>

            </div>
        </div>
    );
}

export default ChatHeader;
