import React from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatMarkdown.css';

function ChatMessage({ message }) {
    const isUser = message.role === 'user';
    
    // Verifica se a mensagem é do Médico Humano ou da IA
    const isDoctor = !isUser && message.text && message.text.includes('PARECER MÉDICO DEFINITIVO');

    return (
        <div className={`flex w-full py-6 ${isUser ? 'bg-[#343541]' : 'bg-[#444654]'} border-b border-black/10`}>
            <div className="max-w-4xl mx-auto w-full flex gap-4 px-4 md:px-6">
                
                {/* AVATAR DINÂMICO */}
                <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 font-bold text-white text-xs">
                    {isUser ? (
                        <div className="w-full h-full bg-blue-600 rounded-sm flex items-center justify-center">
                            Você
                        </div>
                    ) : isDoctor ? (
                        <div className="w-full h-full bg-blue-500 rounded-sm flex items-center justify-center shadow-lg border border-blue-400">
                            DR
                        </div>
                    ) : (
                        <div className="w-full h-full bg-emerald-600 rounded-sm flex items-center justify-center">
                            IA
                        </div>
                    )}
                </div>

                {/* CONTEÚDO DA MENSAGEM */}
                <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                    
                    {/* Renderização da Imagem (se existir) */}
                    {message.image && (
                        <div className="relative group max-w-sm">
                            <img 
                                src={message.image} 
                                alt="Lesão enviada" 
                                className="rounded-lg shadow-md border border-gray-600 w-full h-auto object-cover"
                            />
                        </div>
                    )}

                    {/* Renderização do Texto */}
                    <div className="text-gray-100 text-sm markdown-formatado">
                        <ReactMarkdown>
                            {message.text}
                        </ReactMarkdown>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ChatMessage;