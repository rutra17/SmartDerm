import React from 'react';

export default function ChatMessage({ message }) {
    const isAssistant = message.role === 'assistant';
    
    return (
        <div className={`py-8 ${isAssistant ? 'bg-[#444654]' : ''}`}>
            <div className="max-w-3xl mx-auto px-4 flex gap-6">
                <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center font-bold ${isAssistant ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                    {isAssistant ? 'IA' : 'U'}
                </div>
                <div className="flex-1 space-y-4">
                    {message.image && <img src={message.image} alt="Anexo médico" className="max-w-xs rounded-lg border border-white/10" />}
                    <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
                </div>
            </div>
        </div>
    );
}