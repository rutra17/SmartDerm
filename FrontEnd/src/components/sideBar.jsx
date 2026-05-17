import React from 'react';

export default function Sidebar() {
    return (
        <div className="hidden md:flex w-64 bg-[#202123] p-2 flex-col">
            <button onClick={() => window.location.reload()} className="flex items-center gap-3 p-3 border border-white/20 rounded hover:bg-gray-500/10 transition text-sm">
                + Nova Consulta
            </button>
            <div className="mt-4 flex-1 overflow-y-auto text-xs text-gray-400">
                <p className="p-3 uppercase font-bold tracking-widest opacity-50">Histórico Recente</p>
                <div className="p-3 hover:bg-[#2A2B32] rounded cursor-pointer truncate">Análise_Lesao_Costas.jpg</div>
            </div>
        </div>
    );
}