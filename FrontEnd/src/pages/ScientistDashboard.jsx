import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

function ScientistDashboard() {
    const [carregando, setCarregando] = useState(true);
    const [abaAtiva, setAbaAtiva] = useState('dashboard');

    // Estados do Dashboard Geral
    const [estatisticas, setEstatisticas] = useState({
        totalConsultas: 0,
        totalMensagensIA: 0,
        totalImagens: 0,
        statusConsultas: { pendente: 0, finalizada: 0 },
        modelosIA: {},
        promptsUtilizados: {}
    });

    // Estados da Engenharia de Prompts
    const [listaPrompts, setListaPrompts] = useState([]);
    const [novoPrompt, setNovoPrompt] = useState({ titulo: '', chave: '', instrucao: '' });
    const [salvandoPrompt, setSalvandoPrompt] = useState(false);
    const [promptEmEdicao, setPromptEmEdicao] = useState(null);

    // Estados da Auditoria Visual
    const [consultasAuditoria, setConsultasAuditoria] = useState([]);
    const [casoSelecionado, setCasoSelecionado] = useState(null);

    const PRECOS_API = {
        'gemini': 0.00012,
        'gemini-1.5-flash': 0.00012,
        'gemini-2.5-flash': 0.00015,
        'openai': 0.00250,
        'deepseek': 0.00010,
        'simulacao': 0.00000,
        'Desconhecido': 0.00000
    };

    const getAuthHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
    });

    useEffect(() => {
        carregarDadosEstatisticos();
        carregarPromptsDoBanco();
        carregarDadosAuditoria();
    }, []);

    const carregarDadosEstatisticos = async () => {
        setCarregando(true);
        try {
            const resposta = await fetch('https://api.smartderm.37.27.81.229.sslip.io/api/cientista/estatisticas', { headers: getAuthHeaders() });
            if (resposta.ok) setEstatisticas(await resposta.json());
        } catch (error) { console.error("Erro estatísticas:", error); }
        setCarregando(false);
    };

    const carregarPromptsDoBanco = async () => {
        try {
            const resposta = await fetch('https://api.smartderm.37.27.81.229.sslip.io/api/cientista/prompts', { headers: getAuthHeaders() });
            if (resposta.ok) setListaPrompts(await resposta.json());
        } catch (error) { console.error("Erro prompts:", error); }
    };

    const carregarDadosAuditoria = async () => {
        try {
            const resposta = await fetch('https://api.smartderm.37.27.81.229.sslip.io/api/cientista/auditoria', { headers: getAuthHeaders() });
            if (resposta.ok) setConsultasAuditoria(await resposta.json());
        } catch (error) { console.error("Erro auditoria:", error); }
    };

    const iniciarEdicao = (prompt) => {
        setPromptEmEdicao(prompt);
        setNovoPrompt({ titulo: prompt.titulo, chave: prompt.chave, instrucao: prompt.instrucao });
    };

    const cancelarEdicao = () => {
        setPromptEmEdicao(null);
        setNovoPrompt({ titulo: '', chave: '', instrucao: '' });
    };

    const salvarOuAtualizarPrompt = async (e) => {
        e.preventDefault();
        if (!novoPrompt.titulo.trim() || !novoPrompt.chave.trim() || !novoPrompt.instrucao.trim()) return alert("Preencha todos os campos!");

        setSalvandoPrompt(true);
        const url = promptEmEdicao ? `https://api.smartderm.37.27.81.229.sslip.io/api/cientista/prompts/${promptEmEdicao.id}` : 'https://api.smartderm.37.27.81.229.sslip.io/api/cientista/prompts';
        const method = promptEmEdicao ? 'PUT' : 'POST';

        try {
            const resposta = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(novoPrompt) });
            if (resposta.ok) {
                alert("✅ Prompt salvo com sucesso!");
                cancelarEdicao();
                carregarPromptsDoBanco();
            }
        } catch (error) { console.error(error); }
        setSalvandoPrompt(false);
    };

    const excluirPrompt = async (id) => {
        if (!window.confirm("⚠️ Excluir este prompt permanentemente?")) return;
        try {
            const resposta = await fetch(`https://api.smartderm.37.27.81.229.sslip.io/api/cientista/prompts/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
            if (resposta.ok) { carregarPromptsDoBanco(); cancelarEdicao(); }
        } catch (error) { console.error(error); }
    };

    const calcularPercentagem = (valor, total) => total === 0 ? 0 : Math.round((valor / total) * 100);
    const pctFinalizada = calcularPercentagem(estatisticas.statusConsultas.finalizada, estatisticas.totalConsultas);

    let custoTotalEstimado = 0;
    const listaCustosModelos = Object.entries(estatisticas.modelosIA).map(([modelo, quantidade]) => {
        const precoPorChamada = PRECOS_API[modelo] || 0;
        const custoDoModelo = precoPorChamada * quantidade;
        custoTotalEstimado += custoDoModelo;
        return { modelo, quantidade, precoPorChamada, custoDoModelo };
    });
    const custoMedioPorPaciente = estatisticas.totalConsultas > 0 ? (custoTotalEstimado / estatisticas.totalConsultas) : 0;

    return (
        <div className="flex h-screen w-full bg-[#343541] font-sans text-gray-100">
            
            {/* Barra Lateral */}
            <div className="w-64 flex-shrink-0 bg-[#202123] border-r border-white/10 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-purple-500 flex items-center gap-2"><span>🔬</span> Laboratório IA</h2>
                    <p className="text-xs text-gray-400 mt-1">Painel do Cientista</p>
                </div>
                <div className="flex-1 p-4 space-y-2">
                    <button onClick={() => setAbaAtiva('dashboard')} className={`w-full text-left p-3 rounded-lg border transition font-semibold ${abaAtiva === 'dashboard' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:bg-gray-700/50'}`}>📊 Dashboard Geral</button>
                    <button onClick={() => setAbaAtiva('prompts')} className={`w-full text-left p-3 rounded-lg border transition font-semibold ${abaAtiva === 'prompts' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:bg-gray-700/50'}`}>⚙️ Engenharia Prompts</button>
                    <button onClick={() => setAbaAtiva('custos')} className={`w-full text-left p-3 rounded-lg border transition font-semibold ${abaAtiva === 'custos' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:bg-gray-700/50'}`}>📈 Custos e API</button>
                    <button onClick={() => { setAbaAtiva('auditoria'); carregarDadosAuditoria(); }} className={`w-full text-left p-3 rounded-lg border transition font-semibold ${abaAtiva === 'auditoria' ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:bg-gray-700/50'}`}>🎯 Auditoria Clínica</button>
                </div>
                <div className="p-4 border-t border-white/10">
                    <button onClick={() => { localStorage.clear(); window.location.replace('/'); }} className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-semibold transition">Sair do Portal</button>
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                <div className="w-full h-full animate-fade-in max-w-[1600px] mx-auto">
                    
                    <header className="mb-10 flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {abaAtiva === 'dashboard' && 'Monitorização Científica'}
                                {abaAtiva === 'prompts' && '⚙️ Engenharia de Prompts'}
                                {abaAtiva === 'custos' && '📈 Gestão Financeira e API'}
                                {abaAtiva === 'auditoria' && '🎯 Auditoria e Acurácia Cruzada'}
                            </h1>
                            <p className="text-gray-400">
                                {abaAtiva === 'dashboard' && 'Análise de dados operacionais e de Inteligência Artificial.'}
                                {abaAtiva === 'prompts' && 'Gerencie, modifique e catalogue instruções bases para testes.'}
                                {abaAtiva === 'custos' && 'Métricas de consumo de tokens e viabilidade comercial.'}
                                {abaAtiva === 'auditoria' && 'Validação cruzada: Imagem do Paciente vs Análise da IA vs Parecer do Médico.'}
                            </p>
                        </div>
                        <button onClick={() => { carregarDadosEstatisticos(); carregarDadosAuditoria(); }} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded shadow transition flex gap-2 items-center"><span>🔄</span> Atualizar Dados</button>
                    </header>

                    {carregando ? (
                        <div className="flex justify-center py-20 text-purple-500 animate-pulse">A processar Big Data...</div>
                    ) : (
                        <>
                            {/* DASHBOARD GERAL */}
                            {abaAtiva === 'dashboard' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 flex items-center gap-6 shadow-lg">
                                            <div className="p-4 bg-blue-500/20 rounded-lg text-blue-500 text-3xl">👥</div>
                                            <div>
                                                <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total de Consultas</div>
                                                <div className="text-3xl font-bold text-white mt-1">{estatisticas.totalConsultas}</div>
                                            </div>
                                        </div>
                                        <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 flex items-center gap-6 shadow-lg">
                                            <div className="p-4 bg-emerald-500/20 rounded-lg text-emerald-500 text-3xl">🧠</div>
                                            <div>
                                                <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Respostas Totais</div>
                                                <div className="text-3xl font-bold text-white mt-1">{estatisticas.totalMensagensIA}</div>
                                            </div>
                                        </div>
                                        <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 flex items-center gap-6 shadow-lg">
                                            <div className="p-4 bg-pink-500/20 rounded-lg text-pink-500 text-3xl">📸</div>
                                            <div>
                                                <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Imagens Recebidas</div>
                                                <div className="text-3xl font-bold text-white mt-1">{estatisticas.totalImagens}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col items-center justify-center">
                                            <h3 className="text-lg font-bold mb-6 text-left w-full border-b border-gray-700 pb-2">Taxa de Resolução Médica</h3>
                                            {estatisticas.totalConsultas > 0 ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="relative w-40 h-40 rounded-full mb-6" style={{ background: `conic-gradient(#10b981 ${pctFinalizada}%, #f97316 0)` }}>
                                                        <div className="absolute inset-3 bg-[#202123] rounded-full flex flex-col items-center justify-center text-white">
                                                            <span className="text-3xl font-bold">{pctFinalizada}%</span>
                                                            <span className="text-[10px] text-gray-400 uppercase">Resolvido</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4 text-sm w-full justify-center">
                                                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div><span className="text-gray-300">Finalizadas ({estatisticas.statusConsultas.finalizada || 0})</span></div>
                                                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div><span className="text-gray-300">Pendentes ({estatisticas.statusConsultas.pendente || 0})</span></div>
                                                    </div>
                                                </div>
                                            ) : <p className="text-gray-500 text-sm py-10">Nenhum dado disponível.</p>}
                                        </div>

                                        <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 shadow-lg lg:col-span-2">
                                            <h3 className="text-lg font-bold mb-6 border-b border-gray-700 pb-2">Desempenho: Agentes Utilizados</h3>
                                            <div className="space-y-6">
                                                {(() => {
                                                    const totalHumanos = estatisticas.statusConsultas.finalizada || 0;
                                                    const totalInteracoes = estatisticas.totalMensagensIA + totalHumanos;
                                                    
                                                    const todosAgentes = { ...estatisticas.modelosIA };
                                                    if (totalHumanos > 0) {
                                                        todosAgentes['Médico Humano'] = totalHumanos;
                                                    }

                                                    if (Object.keys(todosAgentes).length === 0) return <p className="text-gray-500">Sem dados.</p>;

                                                    return Object.entries(todosAgentes).map(([modelo, quantidade]) => {
                                                        const percentagem = calcularPercentagem(quantidade, totalInteracoes);
                                                        const corBarra = modelo === 'Médico Humano' ? 'bg-blue-500' : 'bg-purple-500';
                                                        
                                                        return (
                                                            <div key={modelo}>
                                                                <div className="flex justify-between text-sm mb-2">
                                                                    <span className="font-semibold text-gray-200 capitalize">{modelo}</span>
                                                                    <span className="text-gray-400 font-mono">{quantidade} intervenções ({percentagem}%)</span>
                                                                </div>
                                                                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                                                                    <div className={`h-4 rounded-full transition-all duration-1000 ${corBarra}`} style={{ width: `${percentagem}%` }}></div>
                                                                </div>
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 shadow-lg">
                                        <h3 className="text-lg font-bold mb-6 border-b border-gray-700 pb-2">Abordagem: Tipos de Prompts Avaliados</h3>
                                        {Object.entries(estatisticas.promptsUtilizados).length === 0 ? (
                                            <p className="text-gray-500 text-sm">Nenhum prompt específico registado ainda.</p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {Object.entries(estatisticas.promptsUtilizados).map(([prompt, quantidade]) => {
                                                    const percentagem = calcularPercentagem(quantidade, estatisticas.totalMensagensIA);
                                                    return (
                                                        <div key={prompt}>
                                                            <div className="flex justify-between text-sm mb-2">
                                                                <span className="font-semibold text-gray-300 capitalize">{prompt}</span>
                                                                <span className="text-gray-400">{quantidade} usos</span>
                                                            </div>
                                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                                <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${percentagem}%` }}></div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ENGENHARIA DE PROMPTS */}
                            {abaAtiva === 'prompts' && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="bg-[#202123] p-6 rounded-xl border border-purple-500/40 h-fit shadow-xl">
                                        <h3 className="text-lg font-bold mb-4 text-purple-400 border-b border-gray-700 pb-2">{promptEmEdicao ? '✏️ Editar Prompt' : '✨ Novo Prompt'}</h3>
                                        <form onSubmit={salvandoPrompt ? null : salvarOuAtualizarPrompt} className="space-y-4">
                                            <input type="text" placeholder="Título" value={novoPrompt.titulo} onChange={e => setNovoPrompt({...novoPrompt, titulo: e.target.value})} className="w-full bg-[#343541] border border-gray-600 rounded p-2.5 text-white text-sm" />
                                            <input type="text" placeholder="Chave Única" value={novoPrompt.chave} disabled={!!promptEmEdicao} onChange={e => setNovoPrompt({...novoPrompt, chave: e.target.value})} className="w-full bg-[#343541] border border-gray-600 rounded p-2.5 text-white text-sm font-mono" />
                                            <textarea placeholder="Instrução..." value={novoPrompt.instrucao} onChange={e => setNovoPrompt({...novoPrompt, instrucao: e.target.value})} className="w-full bg-[#343541] border border-gray-600 rounded p-2.5 text-white text-sm h-44 resize-none" />
                                            <div className="flex gap-2">
                                                {promptEmEdicao && <button type="button" onClick={cancelarEdicao} className="flex-1 py-3 bg-gray-700 rounded text-white font-bold text-sm">Cancelar</button>}
                                                <button type="submit" disabled={salvandoPrompt} className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 transition rounded text-white font-bold text-sm disabled:opacity-50">Salvar</button>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="lg:col-span-2 space-y-4 max-h-[550px] overflow-y-auto custom-scrollbar">
                                        {listaPrompts.map(p => (
                                            <div key={p.id} className="bg-[#202123] p-5 rounded-xl border border-gray-700 shadow-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div><h4 className="font-bold text-white mr-3 inline-block">{p.titulo}</h4><span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded font-mono">{p.chave}</span></div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => iniciarEdicao(p)} className="p-1.5 bg-gray-700 hover:bg-blue-600/30 border border-gray-600 text-sm rounded">✏️</button>
                                                        <button onClick={() => excluirPrompt(p.id)} className="p-1.5 bg-gray-700 hover:bg-red-600/30 border border-gray-600 text-sm rounded">🗑️</button>
                                                    </div>
                                                </div>
                                                <div className="bg-[#343541] p-3 rounded-lg border border-gray-600 text-sm text-gray-300 font-sans whitespace-pre-wrap">{p.instrucao}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CUSTOS E API */}
                            {abaAtiva === 'custos' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-[#202123] p-6 rounded-xl border border-yellow-500/40 shadow-lg">
                                            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Custo Total Acumulado</div>
                                            <div className="text-4xl font-bold text-yellow-400">${custoTotalEstimado.toFixed(4)}</div>
                                        </div>
                                        <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 shadow-lg">
                                            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Custo Médio por Paciente</div>
                                            <div className="text-4xl font-bold text-white">${custoMedioPorPaciente.toFixed(4)}</div>
                                        </div>
                                        <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 shadow-lg">
                                            <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Total de Requisições</div>
                                            <div className="text-4xl font-bold text-white">{estatisticas.totalMensagensIA}</div>
                                        </div>
                                    </div>

                                    {/* 🌟 MUDANÇA 1: A Tabela de Uso de IAs está de volta! */}
                                    <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 shadow-lg">
                                        <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2 text-white">Tabela de Consumo por Modelo</h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm text-gray-300">
                                                <thead className="bg-[#343541] text-gray-400 font-bold uppercase">
                                                    <tr>
                                                        <th className="px-4 py-3 rounded-tl-lg">Modelo de IA</th>
                                                        <th className="px-4 py-3">Requisições Totais</th>
                                                        <th className="px-4 py-3">Custo Unitário (Estimado)</th>
                                                        <th className="px-4 py-3 rounded-tr-lg text-yellow-400">Custo Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {listaCustosModelos.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="4" className="px-4 py-6 text-center text-gray-500">Nenhum dado financeiro disponível.</td>
                                                        </tr>
                                                    ) : (
                                                        listaCustosModelos.map((item, index) => (
                                                            <tr key={index} className="border-b border-gray-700/50 hover:bg-[#343541]/50 transition">
                                                                <td className="px-4 py-3 font-semibold text-white capitalize">{item.modelo}</td>
                                                                <td className="px-4 py-3">{item.quantidade}</td>
                                                                <td className="px-4 py-3 font-mono text-gray-400">${item.precoPorChamada.toFixed(5)}</td>
                                                                <td className="px-4 py-3 font-mono text-yellow-400 font-bold">${item.custoDoModelo.toFixed(4)}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* AUDITORIA */}
                            {abaAtiva === 'auditoria' && (
                                <div className="flex flex-col xl:flex-row gap-8 w-full">
                                    <div className="w-full xl:w-72 flex-shrink-0 bg-[#202123] p-4 rounded-xl border border-gray-700 max-h-[700px] overflow-y-auto custom-scrollbar space-y-2">
                                        <h3 className="text-sm font-bold text-purple-400 border-b border-gray-700 pb-2 mb-2 uppercase tracking-wider">Histórico de Triagens</h3>
                                        {consultasAuditoria.map(caso => (
                                            <button 
                                                key={caso.id} 
                                                onClick={() => setCasoSelecionado(caso)}
                                                className={`w-full text-left p-3 rounded border text-sm transition flex flex-col gap-1 ${casoSelecionado?.id === caso.id ? 'bg-purple-600/20 border-purple-500 text-purple-300' : 'border-gray-700 hover:bg-gray-800'}`}
                                            >
                                                <div className="font-bold text-white">{caso.nomePaciente}</div>
                                                <div className="text-gray-400 font-mono text-xs">ID: {caso.id.substring(0,8)}...</div>
                                                <div className="flex justify-between mt-1 items-center">
                                                    
                                                    {/* 🌟 MUDANÇA 2: Cor corrigida para o badge "Pendente" ou "Finalizada" */}
                                                    <span className={`text-[10px] px-2 py-1 rounded uppercase font-bold ${
                                                        caso.status === 'finalizada' 
                                                        ? 'bg-emerald-500/20 text-emerald-400' 
                                                        : 'bg-orange-500/20 text-orange-400'
                                                    }`}>
                                                        {caso.status}
                                                    </span>

                                                    <span className="text-purple-400 font-bold text-xs">{caso.analisesIA.length} laudos</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {!casoSelecionado ? (
                                            <div className="bg-[#202123] rounded-xl border border-gray-700 p-12 text-center text-gray-500 h-full flex flex-col items-center justify-center min-h-[500px]">
                                                <span className="text-5xl mb-4">🎯</span>
                                                <h3 className="text-xl font-bold text-white">Modo Auditoria Visual</h3>
                                                <p className="text-base text-gray-400 mt-2 max-w-md">Selecione uma triagem na barra esquerda para auditar o comportamento dos agentes cognitivos.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="bg-[#202123] p-5 rounded-xl border border-gray-700 text-sm text-gray-400 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                                                    <div>Paciente: <span className="text-white font-bold text-base ml-1">{casoSelecionado.nomePaciente}</span></div>
                                                    <div>Médico Responsável: <span className="text-purple-400 font-bold ml-1">{casoSelecionado.medicoHumano}</span></div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="bg-[#202123] p-5 rounded-xl border border-gray-700 flex flex-col shadow-lg">
                                                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 border-b border-gray-700 pb-3 mb-4 flex items-center gap-2">📸 Fotos da Lesão</h4>
                                                        <div className="space-y-4 overflow-y-auto max-h-[500px] custom-scrollbar pr-2">
                                                            {casoSelecionado.imagens.length === 0 ? <p className="text-gray-600 text-sm italic text-center py-10">Sem imagens anexadas.</p> :
                                                                casoSelecionado.imagens.map((url, i) => (
                                                                    <img key={i} src={url} alt="Lesão auditada" className="w-full h-auto object-cover rounded-lg border border-gray-600 shadow" />
                                                                ))
                                                            }
                                                        </div>
                                                    </div>

                                                    <div className="bg-[#202123] p-5 rounded-xl border border-gray-700 flex flex-col shadow-lg">
                                                        <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-400 border-b border-gray-700 pb-3 mb-4 flex items-center gap-2">🧠 Pré-Laudos da IA</h4>
                                                        <div className="space-y-4 overflow-y-auto max-h-[500px] custom-scrollbar pr-2 text-sm">
                                                            {casoSelecionado.analisesIA.length === 0 ? <p className="text-gray-600 italic text-center py-10">Nenhum registo de IA.</p> :
                                                                casoSelecionado.analisesIA.map((ia, i) => (
                                                                    <div key={i} className="bg-[#343541] p-4 rounded-lg border border-gray-600 shadow-sm space-y-3">
                                                                        <div className="flex justify-between border-b border-gray-700 pb-2 font-mono text-[11px] text-purple-400 uppercase font-bold">
                                                                            <span>{ia.modelo} ({ia.prompt})</span>
                                                                            <span className="text-gray-400">⏱️ {ia.latencia}</span>
                                                                        </div>
                                                                        <div className="text-gray-300 leading-relaxed max-h-[250px] overflow-y-auto custom-scrollbar pr-2 markdown-formatado">
                                                                            <ReactMarkdown>{ia.texto}</ReactMarkdown>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>

                                                    <div className="bg-[#202123] p-5 rounded-xl border border-gray-700 flex flex-col shadow-lg">
                                                        <h4 className="text-sm font-bold uppercase tracking-wider text-blue-400 border-b border-gray-700 pb-3 mb-4 flex items-center gap-2">🩺 Diagnóstico Médico</h4>
                                                        <div className="flex-1 bg-[#343541] p-4 rounded-lg border border-gray-600 text-sm text-gray-300 overflow-y-auto max-h-[500px] custom-scrollbar whitespace-pre-wrap leading-relaxed italic">
                                                            {casoSelecionado.laudoMedico}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ScientistDashboard;