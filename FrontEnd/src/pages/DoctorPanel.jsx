import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import '../components/ChatMarkdown.css';

function DoctorPanel() {
    const [filaConsultas, setFilaConsultas] = useState([]);
    const [consultaSelecionada, setConsultaSelecionada] = useState(null);
    
    // 🌟 MUDANÇA 1: O estado inicial agora tem "analisesIA: []" (um array vazio) em vez de uma string
    const [dadosTriagem, setDadosTriagem] = useState({ imagens: [], analisesIA: [] });
    
    const [laudoFinal, setLaudoFinal] = useState('');
    const [carregando, setCarregando] = useState(false);

    // Helper para as requisições autenticadas
    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    });

    useEffect(() => {
        buscarFilaDePacientes();
    }, []);

    const buscarFilaDePacientes = async () => {
        try {
            const resposta = await fetch('https://api.smartderm.37.27.81.229.sslip.io/api/medico/consultas', {
                headers: getAuthHeaders()
            });
            if (resposta.ok) {
                const data = await resposta.json();
                setFilaConsultas(data);
            } else {
                console.error("Erro ao buscar pacientes");
            }
        } catch (error) {
            console.error("Falha na comunicação com a API:", error);
        }
    };

    const abrirTriagem = async (consulta) => {
        setCarregando(true);
        setConsultaSelecionada(consulta);
        
        setLaudoFinal(consulta.laudoMedico || ''); 

        try {
            const resposta = await fetch(`https://api.smartderm.37.27.81.229.sslip.io/api/medico/consultas/${consulta.id}`, {
                headers: getAuthHeaders()
            });

            if (resposta.ok) {
                const data = await resposta.json();
                
                let imagensEncontradas = [];
                let analisesEncontradas = []; 

                if (data.mensagens) {
                    data.mensagens.forEach(msg => {
                        if (msg.imagem_url) {
                            imagensEncontradas.push(msg.imagem_url);
                        }
                        
                        // Guarda todas as respostas da IA que não sejam o laudo do médico
                        if (msg.role === 'assistant' && msg.texto && !msg.texto.includes('PARECER MÉDICO DEFINITIVO')) {
                            analisesEncontradas.push({
                                prompt: msg.prompt_utilizado || 'Padrão',
                                texto: msg.texto
                            });
                        }
                    });
                }

                setDadosTriagem({
                    imagens: imagensEncontradas,
                    analisesIA: analisesEncontradas // Guardamos a lista completa no estado
                });
            }
        } catch (error) {
            console.error("Erro ao carregar detalhes da consulta:", error);
        }
        
        setCarregando(false);
    };

    const guardarLaudoMedico = async () => {
        if (!laudoFinal.trim()) {
            alert("Por favor, escreva um parecer médico antes de guardar.");
            return;
        }

        setCarregando(true); 

        try {
            const resposta = await fetch(`https://api.smartderm.37.27.81.229.sslip.io/api/medico/consultas/${consultaSelecionada.id}/laudo`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ laudoMedico: laudoFinal })
            });

            if (resposta.ok) {
                // Atualizamos o estado localmente
                setConsultaSelecionada(prev => ({...prev, status: 'finalizada', laudoMedico: laudoFinal}));
                alert(`✅ Laudo guardado/atualizado com sucesso!`);
                buscarFilaDePacientes(); // Atualiza a barra lateral
            } else {
                alert("Ocorreu um erro ao guardar o laudo no servidor.");
            }
        } catch (error) {
            console.error("Erro ao guardar o laudo:", error);
            alert("Erro de comunicação com a base de dados.");
        }

        setCarregando(false);
    };

    const fazerLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.replace('/'); 
    };

    return (
        <div className="flex h-screen w-full bg-[#343541] font-sans text-gray-100">
            
            {/* Barra Lateral - Fila de Pacientes */}
            <div className="w-80 bg-[#202123] border-r border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-blue-500 flex items-center gap-2">
                        <span>🩺</span> Portal do Médico
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Fila de Triagem de IA</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {filaConsultas.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center mt-4">Nenhum paciente na fila.</p>
                    ) : (
                        filaConsultas.map(consulta => (
                            <button 
                                key={consulta.id}
                                onClick={() => abrirTriagem(consulta)}
                                className={`w-full text-left p-3 rounded-lg border transition relative ${
                                    consultaSelecionada?.id === consulta.id 
                                    ? 'bg-blue-600/20 border-blue-500' 
                                    : 'border-white/10 hover:bg-gray-700/50'
                                }`}
                            >
                                <div className="font-semibold">{consulta.nome_paciente}</div>
                                <div className="text-xs text-gray-400 mt-1 flex justify-between items-center">
                                    <span>ID: {consulta.id.substring(0,8)}...</span> 
                                    {consulta.status === 'finalizada' ? (
                                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                                            FINALIZADA
                                        </span>
                                    ) : (
                                        <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded text-[10px] font-bold">
                                            PENDENTE
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>
                
                <div className="p-4 border-t border-white/10">
                    <button 
                        onClick={fazerLogout}
                        className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-semibold transition"
                    >
                        Sair do Portal
                    </button>
                </div>
            </div>

            {/* Área Principal - Detalhes da Triagem */}
            <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                {!consultaSelecionada ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <span className="text-6xl mb-4">⚕️</span>
                        <h2 className="text-2xl font-bold mb-2">Selecione um Paciente</h2>
                        <p>Escolha um paciente na fila lateral para rever a triagem da IA.</p>
                    </div>
                ) : carregando ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-blue-500 animate-pulse">A carregar dados médicos...</p>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto w-full animate-fade-in space-y-6">
                        
                        <div className="border-b border-gray-600 pb-4 mb-6">
                            <h2 className="text-3xl font-bold text-white">
                                Paciente: <span className="text-blue-400">{consultaSelecionada.nome_paciente}</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Coluna da Galeria de Imagens */}
                            <div className="bg-[#202123] rounded-xl border border-gray-600 p-4 flex flex-col">
                                <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-700 pb-2">
                                    Imagens Submetidas ({dadosTriagem.imagens.length})
                                </h3>
                                
                                {dadosTriagem.imagens.length > 0 ? (
                                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px] custom-scrollbar">
                                        {dadosTriagem.imagens.map((imgUrl, index) => (
                                            <div key={index} className="relative group">
                                                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                                    Imagem {index + 1}
                                                </div>
                                                <img 
                                                    src={imgUrl} 
                                                    alt={`Lesão do Paciente - Imagem ${index + 1}`} 
                                                    className="w-full h-auto object-cover rounded-lg shadow-lg border border-gray-600"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center bg-[#343541] rounded-lg border border-dashed border-gray-500 min-h-[200px]">
                                        <p className="text-gray-500 text-sm">Nenhuma imagem enviada.</p>
                                    </div>
                                )}
                            </div>

                            {/* 🌟 MUDANÇA 2: Coluna da Análise IA totalmente atualizada para mostrar múltiplos laudos */}
                            <div className="bg-[#202123] rounded-xl border border-gray-600 p-4 flex flex-col">
                                <h3 className="text-lg font-semibold text-emerald-500 mb-4 border-b border-gray-700 pb-2 flex items-center gap-2">
                                    <span>🧠</span> Histórico de Pré-Laudos da IA
                                </h3>
                                <div className="flex-1 bg-[#343541] p-4 rounded-lg text-sm text-gray-300 overflow-y-auto max-h-[400px] custom-scrollbar space-y-6">
                                    
                                    {/* Faz um map em todas as análises encontradas */}
                                    {dadosTriagem.analisesIA && dadosTriagem.analisesIA.length > 0 ? (
                                        dadosTriagem.analisesIA.map((analise, index) => (
                                            <div key={index} className="border border-gray-600 rounded-lg p-3 bg-[#2a2b32] shadow-sm">
                                                <div className="text-xs font-bold text-purple-400 mb-2 uppercase tracking-wider border-b border-gray-600 pb-1 flex justify-between">
                                                    <span>Prompt Utilizado: {analise.prompt}</span>
                                                    <span className="text-gray-500">#{index + 1}</span>
                                                </div>
                                                <div className="markdown-formatado">
                                                    <ReactMarkdown>
                                                        {analise.texto}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic text-center py-10">Nenhuma análise de IA encontrada para esta triagem.</p>
                                    )}

                                </div>
                            </div>

                        </div>

                        {/* Área do Laudo Final do Médico */}
                        <div className="bg-[#202123] rounded-xl border border-blue-500/50 p-4 mt-8">
                            <h3 className="text-lg font-semibold text-white mb-4">Parecer Médico Final</h3>
                            <textarea 
                                value={laudoFinal}
                                onChange={(e) => setLaudoFinal(e.target.value)}
                                placeholder="Baseado nas imagens e no pré-laudo da IA, digite o seu diagnóstico e recomendação clínica aqui..."
                                className="w-full bg-[#343541] border border-gray-600 rounded-lg p-4 text-white focus:outline-none focus:border-blue-500 min-h-[150px] resize-none mb-4"
                            />
                            <div className="flex justify-end">
                                <button 
                                    onClick={guardarLaudoMedico}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-bold shadow-lg transition"
                                >
                                    {consultaSelecionada.status === 'finalizada' 
                                        ? 'Atualizar Laudo' 
                                        : 'Guardar Laudo e Finalizar'}
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}

export default DoctorPanel;