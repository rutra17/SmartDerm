import React, { useState, useEffect } from 'react';
import { getConsultas, getMensagens, getPrompts, criarPrompt, atualizarPrompt, excluirPromptAPI } from '../services/api';

function ScientistPanel() {
    const [carregando, setCarregando] = useState(true);
    const [abaAtiva, setAbaAtiva] = useState('dashboard');

    const [estatisticas, setEstatisticas] = useState({
        totalConsultas: 0,
        totalMensagensIA: 0,
        totalImagens: 0,
        statusConsultas: { pendente: 0, finalizada: 0 },
        modelosIA: {},
        promptsUtilizados: {},
    });

    const [listaPrompts, setListaPrompts] = useState([]);
    const [novoPrompt, setNovoPrompt] = useState({ titulo: '', chave: '', comando: '' });
    const [salvandoPrompt, setSalvandoPrompt] = useState(false);
    const [promptEmEdicao, setPromptEmEdicao] = useState(null);

    const PRECOS_API = {
        gemini: 0.00012,
        openai: 0.00250,
        deepseek: 0.00010,
        simulacao: 0.0,
        Desconhecido: 0.0,
    };

    useEffect(() => {
        carregarDadosEstatisticos();
        carregarPromptsDoBanco();
    }, []);

    const carregarDadosEstatisticos = async () => {
        setCarregando(true);
        try {
            const consultas = await getConsultas();

            let contagemModelos = {};
            let contagemPrompts = {};
            let contagemStatus = { pendente: 0, finalizada: 0 };
            let totalDeImagens = 0;
            let totalDeIA = 0;

            if (Array.isArray(consultas)) {
                consultas.forEach(c => {
                    const status = c.status || 'pendente';
                    contagemStatus[status] = (contagemStatus[status] || 0) + 1;
                });
            }

            // Busca mensagens de todas as consultas
            if (Array.isArray(consultas)) {
                for (const consulta of consultas) {
                    const mensagens = await getMensagens(consulta.id);
                    if (Array.isArray(mensagens)) {
                        mensagens.forEach(msg => {
                            if (msg.imagem_url) totalDeImagens++;
                            if (msg.role === 'assistant' && msg.ia_utilizada) {
                                totalDeIA++;
                                const modelo = msg.ia_utilizada || 'Desconhecido';
                                contagemModelos[modelo] = (contagemModelos[modelo] || 0) + 1;
                                const prompt = msg.prompt_utilizado || 'Padrão';
                                contagemPrompts[prompt] = (contagemPrompts[prompt] || 0) + 1;
                            }
                        });
                    }
                }
            }

            setEstatisticas({
                totalConsultas: Array.isArray(consultas) ? consultas.length : 0,
                totalMensagensIA: totalDeIA,
                totalImagens: totalDeImagens,
                statusConsultas: contagemStatus,
                modelosIA: contagemModelos,
                promptsUtilizados: contagemPrompts,
            });
        } catch (error) {
            console.error("Erro estatísticas:", error);
        } finally {
            setCarregando(false);
        }
    };

    const carregarPromptsDoBanco = async () => {
        const data = await getPrompts();
        if (Array.isArray(data)) setListaPrompts(data);
    };

    const iniciarEdicao = (prompt) => {
        setPromptEmEdicao(prompt);
        setNovoPrompt({ titulo: prompt.titulo, chave: prompt.chave_identificadora, comando: prompt.comando_base });
    };

    const cancelarEdicao = () => {
        setPromptEmEdicao(null);
        setNovoPrompt({ titulo: '', chave: '', comando: '' });
    };

    const salvarOuAtualizarPrompt = async (e) => {
        e.preventDefault();
        if (!novoPrompt.titulo.trim() || !novoPrompt.chave.trim() || !novoPrompt.comando.trim()) {
            alert("Preencha todos os campos do prompt!");
            return;
        }

        setSalvandoPrompt(true);

        if (promptEmEdicao) {
            const data = await atualizarPrompt(promptEmEdicao.id, { titulo: novoPrompt.titulo, comando_base: novoPrompt.comando });
            if (!data.error) {
                alert("✅ Prompt atualizado!");
                cancelarEdicao();
                carregarPromptsDoBanco();
            }
        } else {
            const data = await criarPrompt({
                titulo: novoPrompt.titulo,
                chave_identificadora: novoPrompt.chave.toLowerCase().replace(/\s/g, '_'),
                comando_base: novoPrompt.comando,
            });
            if (!data.error) {
                alert("✅ Novo prompt cadastrado!");
                setNovoPrompt({ titulo: '', chave: '', comando: '' });
                carregarPromptsDoBanco();
            } else {
                alert("❌ " + data.error);
            }
        }
        setSalvandoPrompt(false);
    };

    const excluirPrompt = async (id) => {
        if (!window.confirm("⚠️ Tem certeza que deseja excluir este prompt?")) return;
        const data = await excluirPromptAPI(id);
        if (!data.error) {
            alert("🗑️ Prompt removido!");
            if (promptEmEdicao && promptEmEdicao.id === id) cancelarEdicao();
            carregarPromptsDoBanco();
        }
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

    const custoMedioPorPaciente = estatisticas.totalConsultas > 0 ? custoTotalEstimado / estatisticas.totalConsultas : 0;

    const fazerLogout = () => {
        localStorage.removeItem('smartderm_token');
        localStorage.removeItem('smartderm_user');
        window.location.replace('/');
    };

    return (
        <div className="flex h-screen w-full bg-[#343541] font-sans text-gray-100">

            <div className="w-64 bg-[#202123] border-r border-white/10 flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-bold text-purple-500 flex items-center gap-2"><span>🔬</span> Laboratório IA</h2>
                    <p className="text-xs text-gray-400 mt-1">Painel do Cientista</p>
                </div>
                <div className="flex-1 p-4 space-y-2">
                    {['dashboard', 'prompts', 'custos'].map(aba => (
                        <button key={aba} onClick={() => setAbaAtiva(aba)}
                            className={`w-full text-left p-3 rounded-lg border transition font-semibold ${
                                abaAtiva === aba ? 'bg-purple-600/20 border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:bg-gray-700/50'
                            }`}
                        >
                            {aba === 'dashboard' && '📊 Dashboard Geral'}
                            {aba === 'prompts' && '⚙️ Engenharia Prompts'}
                            {aba === 'custos' && '📈 Custos e API'}
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-white/10">
                    <button onClick={fazerLogout} className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-semibold transition">Sair do Portal</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10">
                <div className="max-w-6xl mx-auto animate-fade-in">

                    <header className="mb-10 flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {abaAtiva === 'dashboard' && 'Monitorização Científica'}
                                {abaAtiva === 'prompts' && '⚙️ Engenharia de Prompts'}
                                {abaAtiva === 'custos' && '📈 Gestão Financeira e API'}
                            </h1>
                            <p className="text-gray-400">
                                {abaAtiva === 'dashboard' && 'Análise de dados operacionais e de Inteligência Artificial.'}
                                {abaAtiva === 'prompts' && 'Gerencie, modifique e catalogue instruções bases para testes.'}
                                {abaAtiva === 'custos' && 'Métricas de consumo de tokens e viabilidade comercial.'}
                            </p>
                        </div>
                        <button onClick={carregarDadosEstatisticos} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded shadow transition flex gap-2 items-center">
                            <span>🔄</span> Atualizar Dados
                        </button>
                    </header>

                    {carregando ? (
                        <div className="flex justify-center py-20 text-purple-500 animate-pulse">A processar dados...</div>
                    ) : (
                        <>
                            {abaAtiva === 'dashboard' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 flex items-center gap-6 shadow-lg">
                                            <div className="p-4 bg-blue-500/20 rounded-lg text-blue-500 text-3xl">👥</div>
                                            <div>
                                                <div className="text-gray-400 text-xs font-semibold uppercase">Total de Pacientes</div>
                                                <div className="text-3xl font-bold text-white mt-1">{estatisticas.totalConsultas}</div>
                                            </div>
                                        </div>
                                        <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 flex items-center gap-6 shadow-lg">
                                            <div className="p-4 bg-emerald-500/20 rounded-lg text-emerald-500 text-3xl">🧠</div>
                                            <div>
                                                <div className="text-gray-400 text-xs font-semibold uppercase">Respostas da IA</div>
                                                <div className="text-3xl font-bold text-white mt-1">{estatisticas.totalMensagensIA}</div>
                                            </div>
                                        </div>
                                        <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 flex items-center gap-6 shadow-lg">
                                            <div className="p-4 bg-pink-500/20 rounded-lg text-pink-500 text-3xl">📸</div>
                                            <div>
                                                <div className="text-gray-400 text-xs font-semibold uppercase">Imagens Recebidas</div>
                                                <div className="text-3xl font-bold text-white mt-1">{estatisticas.totalImagens}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                        <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col items-center justify-center">
                                            <h3 className="text-lg font-bold mb-6 text-left w-full border-b border-gray-700 pb-2">Taxa de Resolução</h3>
                                            {estatisticas.totalConsultas > 0 ? (
                                                <div className="flex flex-col items-center">
                                                    <div className="relative w-40 h-40 rounded-full mb-6" style={{ background: `conic-gradient(#10b981 ${pctFinalizada}%, #f97316 0)` }}>
                                                        <div className="absolute inset-3 bg-[#202123] rounded-full flex flex-col items-center justify-center text-white">
                                                            <span className="text-3xl font-bold">{pctFinalizada}%</span>
                                                            <span className="text-[10px] text-gray-400 uppercase">Resolvido</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4 text-sm">
                                                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div><span>Finalizadas ({estatisticas.statusConsultas.finalizada})</span></div>
                                                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div><span>Pendentes ({estatisticas.statusConsultas.pendente})</span></div>
                                                    </div>
                                                </div>
                                            ) : <p className="text-gray-500 text-sm">Sem dados.</p>}
                                        </div>

                                        <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 shadow-lg lg:col-span-2">
                                            <h3 className="text-lg font-bold mb-6 border-b border-gray-700 pb-2">Modelos de IA Utilizados</h3>
                                            {Object.entries(estatisticas.modelosIA).length === 0 ? (
                                                <p className="text-gray-500 text-sm">Nenhum dado de IA registado.</p>
                                            ) : (
                                                <div className="space-y-6">
                                                    {Object.entries(estatisticas.modelosIA).map(([modelo, quantidade]) => {
                                                        const pct = calcularPercentagem(quantidade, estatisticas.totalMensagensIA);
                                                        return (
                                                            <div key={modelo}>
                                                                <div className="flex justify-between text-sm mb-2">
                                                                    <span className="font-semibold capitalize">{modelo}</span>
                                                                    <span className="text-gray-400 font-mono">{quantidade} ({pct}%)</span>
                                                                </div>
                                                                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                                                                    <div className="bg-purple-500 h-4 rounded-full" style={{ width: `${pct}%` }}></div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {abaAtiva === 'prompts' && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="bg-[#202123] p-6 rounded-xl border border-purple-500/40 h-fit shadow-xl">
                                        <h3 className="text-lg font-bold mb-4 text-purple-400 border-b border-gray-700 pb-2">
                                            {promptEmEdicao ? '✏️ Editar Prompt' : '✨ Novo Prompt'}
                                        </h3>
                                        <form onSubmit={salvandoPrompt ? undefined : salvarOuAtualizarPrompt} className="space-y-4">
                                            <input type="text" placeholder="Título" value={novoPrompt.titulo} onChange={e => setNovoPrompt({ ...novoPrompt, titulo: e.target.value })} className="w-full bg-[#343541] border border-gray-600 rounded p-2.5 text-white text-sm" />
                                            <input type="text" placeholder="Chave Única" value={novoPrompt.chave} disabled={!!promptEmEdicao} onChange={e => setNovoPrompt({ ...novoPrompt, chave: e.target.value })} className="w-full bg-[#343541] border border-gray-600 rounded p-2.5 text-white text-sm font-mono" />
                                            <textarea placeholder="Comando Base..." value={novoPrompt.comando} onChange={e => setNovoPrompt({ ...novoPrompt, comando: e.target.value })} className="w-full bg-[#343541] border border-gray-600 rounded p-2.5 text-white text-sm h-44 resize-none" />
                                            <div className="flex gap-2">
                                                {promptEmEdicao && <button type="button" onClick={cancelarEdicao} className="flex-1 py-3 bg-gray-700 rounded text-white font-bold text-sm">Cancelar</button>}
                                                <button type="submit" className="flex-1 py-3 bg-purple-600 rounded text-white font-bold text-sm">{promptEmEdicao ? 'Atualizar' : 'Salvar'}</button>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="lg:col-span-2 space-y-4 max-h-[550px] overflow-y-auto pr-2">
                                        {listaPrompts.map(p => (
                                            <div key={p.id} className="bg-[#202123] p-5 rounded-xl border border-gray-700 shadow-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-white mr-3 inline-block">{p.titulo}</h4>
                                                        <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-0.5 rounded font-mono">{p.chave_identificadora}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => iniciarEdicao(p)} className="p-1.5 bg-gray-700 hover:bg-blue-600/30 border border-gray-600 text-sm rounded">✏️</button>
                                                        {p.chave_identificadora !== 'padrao' && (
                                                            <button onClick={() => excluirPrompt(p.id)} className="p-1.5 bg-gray-700 hover:bg-red-600/30 border border-gray-600 text-sm rounded">🗑️</button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="bg-[#343541] p-3 rounded-lg border border-gray-600 text-sm text-gray-300 whitespace-pre-wrap">{p.comando_base}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {abaAtiva === 'custos' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-[#202123] p-6 rounded-xl border border-yellow-500/40 shadow-lg">
                                            <div className="text-gray-400 text-xs font-semibold uppercase mb-2">Custo Total Acumulado</div>
                                            <div className="text-4xl font-bold text-yellow-400">${custoTotalEstimado.toFixed(4)}</div>
                                        </div>
                                        <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 shadow-lg">
                                            <div className="text-gray-400 text-xs font-semibold uppercase mb-2">Custo Médio por Paciente</div>
                                            <div className="text-4xl font-bold text-white">${custoMedioPorPaciente.toFixed(4)}</div>
                                        </div>
                                        <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 shadow-lg">
                                            <div className="text-gray-400 text-xs font-semibold uppercase mb-2">Total de Requisições</div>
                                            <div className="text-4xl font-bold text-white">{estatisticas.totalMensagensIA}</div>
                                        </div>
                                    </div>

                                    <div className="bg-[#202123] rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                                        <div className="p-6 border-b border-gray-700">
                                            <h3 className="text-lg font-bold text-white">Detalhamento por IA</h3>
                                        </div>
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-[#343541] text-gray-400 font-semibold uppercase">
                                                <tr>
                                                    <th className="px-6 py-4 border-b border-gray-700">Modelo</th>
                                                    <th className="px-6 py-4 border-b border-gray-700 text-right">Chamadas</th>
                                                    <th className="px-6 py-4 border-b border-gray-700 text-right">Preço/chamada</th>
                                                    <th className="px-6 py-4 border-b border-gray-700 text-right">Custo Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700">
                                                {listaCustosModelos.length === 0 ? (
                                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Sem dados.</td></tr>
                                                ) : listaCustosModelos.map(item => (
                                                    <tr key={item.modelo} className="hover:bg-gray-800/50 transition">
                                                        <td className="px-6 py-4 text-white font-medium capitalize">{item.modelo}</td>
                                                        <td className="px-6 py-4 text-right font-mono">{item.quantidade}</td>
                                                        <td className="px-6 py-4 text-right text-gray-400">${item.precoPorChamada.toFixed(5)}</td>
                                                        <td className="px-6 py-4 text-right text-yellow-400 font-bold">${item.custoDoModelo.toFixed(5)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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

export default ScientistPanel;
