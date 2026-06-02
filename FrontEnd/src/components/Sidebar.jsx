import React from 'react';

export default function Sidebar({ onNewClick, history, activeId, onSelect }) {
    return (
        <div className="w-64 bg-[#202123] p-2 flex flex-col hidden md:flex">
            <button 
                onClick={onNewClick} 
                className="flex items-center justify-center gap-3 p-3 border border-white/20 rounded hover:bg-gray-500/10 transition text-sm font-semibold text-white"
            >
                + Nova Consulta
            </button>
            
            <div className="flex-col flex-1 overflow-y-auto mt-6">
                <div className="text-xs text-gray-500 font-semibold px-3 mb-2">HISTÓRICO RECENTE</div>
                
                {history.length === 0 ? (
                    <div className="text-gray-500 text-xs px-3 italic">Nenhuma consulta salva.</div>
                ) : (
                    history.map(chat => (
                        <button
                            key={chat.id}
                            onClick={() => onSelect(chat.id)}
                            className={`w-full text-left truncate p-3 rounded text-sm transition mt-1 ${
                                activeId === chat.id 
                                ? 'bg-[#343541] text-white' 
                                : 'text-gray-300 hover:bg-[#2A2B32]'
                            }`}
                        >
                            💬 {chat.nome_paciente || 'Paciente sem nome'}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
