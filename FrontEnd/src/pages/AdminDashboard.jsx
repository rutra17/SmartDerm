import React, { useState, useEffect } from 'react';

function AdminDashboard() {
    const [abaAtiva, setAbaAtiva] = useState('resumo');
    const [carregando, setCarregando] = useState(true);
    
    // Dados do Sistema
    const [dados, setDados] = useState({
        pacientes: [],
        medicos: [],
        cientistas: [],
        consultas: []
    });

    // Estado do formulário de criação
    const [novoUsuario, setNovoUsuario] = useState({
        tipo: 'medico', // 'medico' ou 'cientista'
        username: '',
        senha: '',
        nome: '',
        email: '',
        extra: '' // CRM ou Instituição
    });
    const [criando, setCriando] = useState(false);

    // 🌟 NOVA FUNÇÃO: Pega o Token do localStorage e monta o cabeçalho de autorização
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    useEffect(() => {
        carregarTudo();
    }, []);

    const carregarTudo = async () => {
        setCarregando(true);
        try {
            const resposta = await fetch('https://api.smartderm.37.27.81.229.sslip.io/api/admin/listar-tudo', { 
                method: 'GET',
                headers: getAuthHeaders() 
            });
            
            if (resposta.ok) {
                const data = await resposta.json();
                setDados(data);
            } else {
                console.error("Erro na resposta do servidor:", resposta.status);
            }
        } catch (error) {
            console.error("Erro ao carregar dados do admin:", error);
        }
        setCarregando(false);
    };

    const handleCriarUsuario = async (e) => {
        e.preventDefault();
        if (!novoUsuario.username || !novoUsuario.senha || !novoUsuario.nome || !novoUsuario.extra) {
            return alert("Preencha todos os campos obrigatórios!");
        }

        setCriando(true);
        try {
            const resposta = await fetch('https://api.smartderm.37.27.81.229.sslip.io/api/admin/criar-usuario', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(novoUsuario)
            });

            if (resposta.ok) {
                alert(`${novoUsuario.tipo.toUpperCase()} criado com sucesso!`);
                setNovoUsuario({ ...novoUsuario, username: '', senha: '', nome: '', email: '', extra: '' });
                carregarTudo(); // Atualiza as listas
            } else {
                const erro = await resposta.json();
                alert(erro.erro || "Erro ao criar utilizador.");
            }
        } catch (error) {
            console.error("Erro:", error);
        }
        setCriando(false);
    };

    const handleDeletar = async (tipo, id, nome) => {
        if (!window.confirm(`ATENÇÃO: Tem a certeza absoluta que deseja apagar o ${tipo} "${nome}"? Esta ação não pode ser desfeita e apagará todos os dados dependentes!`)) {
            return;
        }

        try {
            const resposta = await fetch(`https://api.smartderm.37.27.81.229.sslip.io/api/admin/deletar/${tipo}/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            if (resposta.ok) {
                carregarTudo(); // Atualiza a tela
            } else {
                const erro = await resposta.json();
                alert(erro.erro || "Erro ao apagar.");
            }
        } catch (error) {
            console.error("Erro ao deletar:", error);
        }
    };

    // 🌟 NOVA FUNÇÃO: Gerar link de convite rápido
    const gerarConviteLink = async () => {
        try {
            const resposta = await fetch('https://api.smartderm.37.27.81.229.sslip.io/api/admin/gerar-convite', {
                method: 'POST',
                headers: getAuthHeaders()
            });
            const responseData = await resposta.json();
            
            if (resposta.ok) {
                // 🌟 O SEGREDO ESTÁ AQUI: window.location.origin pega o endereço exato de onde o SysAdmin está aceder
                const linkCorreto = `${window.location.origin}/convite/${responseData.token}`;
                
                navigator.clipboard.writeText(linkCorreto);
                alert(`✅ Convite gerado e copiado para a sua área de transferência!\n\nLink: ${linkCorreto}\n(Expira em 24h)`);
            } else {
                alert(responseData.erro || "Erro ao gerar convite.");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro ao conectar com o servidor para gerar convite.");
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#343541] font-sans text-gray-100">
            
            {/* BARRA LATERAL (GOD MODE) */}
            <div className="w-64 flex-shrink-0 bg-[#1a1b20] border-r border-red-900/50 flex flex-col shadow-2xl z-10">
                <div className="p-6 border-b border-red-900/50 bg-red-950/20">
                    <h2 className="text-xl font-black text-red-500 flex items-center gap-2">
                        SysAdmin
                    </h2>
                    <p className="text-xs text-red-400/70 mt-1 uppercase tracking-widest">Acesso Absoluto</p>
                </div>
                <div className="flex-1 p-4 space-y-2">
                    <button onClick={() => setAbaAtiva('resumo')} className={`w-full text-left p-3 rounded-lg border transition font-bold ${abaAtiva === 'resumo' ? 'bg-red-600/20 border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:bg-gray-800'}`}>📊 Visão Geral</button>
                    <button onClick={() => setAbaAtiva('pacientes')} className={`w-full text-left p-3 rounded-lg border transition font-bold ${abaAtiva === 'pacientes' ? 'bg-red-600/20 border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:bg-gray-800'}`}>👤 Pacientes</button>
                    <button onClick={() => setAbaAtiva('medicos')} className={`w-full text-left p-3 rounded-lg border transition font-bold ${abaAtiva === 'medicos' ? 'bg-red-600/20 border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:bg-gray-800'}`}>🩺 Médicos</button>
                    <button onClick={() => setAbaAtiva('cientistas')} className={`w-full text-left p-3 rounded-lg border transition font-bold ${abaAtiva === 'cientistas' ? 'bg-red-600/20 border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:bg-gray-800'}`}>🔬 Cientistas</button>
                    <button onClick={() => setAbaAtiva('consultas')} className={`w-full text-left p-3 rounded-lg border transition font-bold ${abaAtiva === 'consultas' ? 'bg-red-600/20 border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:bg-gray-800'}`}>📁 Consultas (Triagens)</button>
                </div>
                <div className="p-4 border-t border-red-900/50">
                    <button onClick={() => { localStorage.clear(); window.location.replace('/'); }} className="w-full py-2 bg-gray-800 hover:bg-red-900/50 hover:text-red-400 border border-transparent hover:border-red-900 rounded text-sm font-bold transition">Sair do Sistema</button>
                </div>
            </div>

            {/* ÁREA PRINCIPAL */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
                <div className="max-w-[1400px] w-full mx-auto animate-fade-in">
                    
                    <header className="mb-10 flex justify-between items-end border-b border-gray-700 pb-6">
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2">Controle Mestre</h1>
                            <p className="text-gray-400">Gestão global de utilizadores, equipa médica e base de dados.</p>
                        </div>
                        {/* 🌟 Botões atualizados com Gerar Convite */}
                        <div className="flex gap-4">
                            <button onClick={gerarConviteLink} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded shadow transition flex gap-2 items-center text-sm font-bold">
                                <span>✉️</span> Gerar Convite Rápido
                            </button>
                            <button onClick={carregarTudo} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded shadow transition flex gap-2 items-center text-sm font-bold">
                                <span>🔄</span> Sincronizar Banco
                            </button>
                        </div>
                    </header>

                    {carregando ? (
                        <div className="flex justify-center py-20 text-red-500 animate-pulse font-bold text-xl">A aceder aos registos globais...</div>
                    ) : (
                        <>
                            {/* ABA: VISÃO GERAL */}
                            {abaAtiva === 'resumo' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 shadow-lg border-t-4 border-t-blue-500">
                                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Pacientes Registados</div>
                                        <div className="text-4xl font-black text-white mt-2">{dados.pacientes?.length || 0}</div>
                                    </div>
                                    <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 shadow-lg border-t-4 border-t-emerald-500">
                                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Médicos Ativos</div>
                                        <div className="text-4xl font-black text-white mt-2">{dados.medicos?.length || 0}</div>
                                    </div>
                                    <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 shadow-lg border-t-4 border-t-purple-500">
                                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Cientistas de Dados</div>
                                        <div className="text-4xl font-black text-white mt-2">{dados.cientistas?.length || 0}</div>
                                    </div>
                                    <div className="bg-[#202123] p-6 rounded-xl border border-gray-700 shadow-lg border-t-4 border-t-orange-500">
                                        <div className="text-gray-400 text-xs font-bold uppercase tracking-wider">Consultas Totais</div>
                                        <div className="text-4xl font-black text-white mt-2">{dados.consultas?.length || 0}</div>
                                    </div>
                                </div>
                            )}

                            {/* ABA: PACIENTES */}
                            {abaAtiva === 'pacientes' && (
                                <div className="bg-[#202123] rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                                    <div className="p-4 bg-gray-800/50 border-b border-gray-700"><h3 className="font-bold text-white">Base de Dados de Pacientes</h3></div>
                                    <table className="w-full text-left text-sm text-gray-300">
                                        <thead className="bg-[#343541] text-gray-400 text-xs uppercase">
                                            <tr>
                                                <th className="px-4 py-3">ID</th>
                                                <th className="px-4 py-3">Nome</th>
                                                <th className="px-4 py-3">Username</th>
                                                {/* 🌟 Novas colunas de Status */}
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3">Último Login</th>
                                                <th className="px-4 py-3">Data de Registo</th>
                                                <th className="px-4 py-3 text-right">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dados.pacientes?.map(p => (
                                                <tr key={p.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                                                    <td className="px-4 py-3 font-mono text-xs">{p.id.substring(0,8)}</td>
                                                    <td className="px-4 py-3 font-bold text-white">{p.nome}</td>
                                                    <td className="px-4 py-3 text-blue-400">@{p.username}</td>
                                                    {/* 🌟 Bolinha de status online/offline */}
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${p.isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                            <span className={`w-2 h-2 rounded-full ${p.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}></span>
                                                            {p.isOnline ? 'Online' : 'Offline'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-gray-400">{p.ultimoLogin ? new Date(p.ultimoLogin).toLocaleString('pt-BR') : 'Nunca'}</td>
                                                    <td className="px-4 py-3">{new Date(p.criadoEm).toLocaleDateString('pt-BR')}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={() => handleDeletar('paciente', p.id, p.nome)} className="px-3 py-1 bg-red-900/30 hover:bg-red-600 text-red-500 hover:text-white rounded transition text-xs font-bold">Apagar</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* ABA: MÉDICOS (Com formulário de criação) */}
                            {abaAtiva === 'medicos' && (
                                <div className="space-y-8">
                                    <div className="bg-[#202123] p-6 rounded-xl border border-emerald-500/30 shadow-lg">
                                        <h3 className="text-lg font-bold mb-4 text-emerald-400 flex items-center gap-2"><span>➕</span> Registar Novo Médico</h3>
                                        <form onSubmit={handleCriarUsuario} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                            <input type="text" placeholder="Nome Completo" value={novoUsuario.nome} onChange={e => setNovoUsuario({...novoUsuario, nome: e.target.value, tipo: 'medico'})} className="bg-[#343541] border border-gray-600 rounded p-2 text-sm text-white" />
                                            <input type="text" placeholder="Username" value={novoUsuario.username} onChange={e => setNovoUsuario({...novoUsuario, username: e.target.value})} className="bg-[#343541] border border-gray-600 rounded p-2 text-sm text-white" />
                                            <input type="password" placeholder="Senha" value={novoUsuario.senha} onChange={e => setNovoUsuario({...novoUsuario, senha: e.target.value})} className="bg-[#343541] border border-gray-600 rounded p-2 text-sm text-white" />
                                            <input type="text" placeholder="CRM" value={novoUsuario.extra} onChange={e => setNovoUsuario({...novoUsuario, extra: e.target.value})} className="bg-[#343541] border border-emerald-500/50 rounded p-2 text-sm text-white" />
                                            <button type="submit" disabled={criando} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded p-2 transition">Criar Médico</button>
                                        </form>
                                    </div>

                                    <div className="bg-[#202123] rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                                        <div className="p-4 bg-gray-800/50 border-b border-gray-700"><h3 className="font-bold text-white">Corpo Clínico</h3></div>
                                        <table className="w-full text-left text-sm text-gray-300">
                                            <thead className="bg-[#343541] text-gray-400 text-xs uppercase">
                                                <tr>
                                                    <th className="px-4 py-3">CRM</th>
                                                    <th className="px-4 py-3">Nome do Médico</th>
                                                    <th className="px-4 py-3">Username</th>
                                                    {/* 🌟 Novas colunas de Status */}
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Último Login</th>
                                                    <th className="px-4 py-3 text-right">Ação</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dados.medicos?.map(m => (
                                                    <tr key={m.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                                                        <td className="px-4 py-3 font-mono font-bold text-emerald-400">{m.crm}</td>
                                                        <td className="px-4 py-3 font-bold text-white">Dr(a). {m.nome}</td>
                                                        <td className="px-4 py-3 text-gray-400">@{m.username}</td>
                                                        {/* 🌟 Bolinha de status online/offline */}
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${m.isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                                <span className={`w-2 h-2 rounded-full ${m.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}></span>
                                                                {m.isOnline ? 'Online' : 'Offline'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-gray-400">{m.ultimoLogin ? new Date(m.ultimoLogin).toLocaleString('pt-BR') : 'Nunca'}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button onClick={() => handleDeletar('medico', m.id, m.nome)} className="px-3 py-1 bg-red-900/30 hover:bg-red-600 text-red-500 hover:text-white rounded transition text-xs font-bold">Apagar</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* ABA: CIENTISTAS (Com formulário de criação) */}
                            {abaAtiva === 'cientistas' && (
                                <div className="space-y-8">
                                    <div className="bg-[#202123] p-6 rounded-xl border border-purple-500/30 shadow-lg">
                                        <h3 className="text-lg font-bold mb-4 text-purple-400 flex items-center gap-2"><span>➕</span> Registar Novo Cientista</h3>
                                        <form onSubmit={handleCriarUsuario} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                            <input type="text" placeholder="Nome Completo" value={novoUsuario.nome} onChange={e => setNovoUsuario({...novoUsuario, nome: e.target.value, tipo: 'cientista'})} className="bg-[#343541] border border-gray-600 rounded p-2 text-sm text-white" />
                                            <input type="text" placeholder="Username" value={novoUsuario.username} onChange={e => setNovoUsuario({...novoUsuario, username: e.target.value})} className="bg-[#343541] border border-gray-600 rounded p-2 text-sm text-white" />
                                            <input type="password" placeholder="Senha" value={novoUsuario.senha} onChange={e => setNovoUsuario({...novoUsuario, senha: e.target.value})} className="bg-[#343541] border border-gray-600 rounded p-2 text-sm text-white" />
                                            <input type="text" placeholder="Instituição (Opcional)" value={novoUsuario.extra} onChange={e => setNovoUsuario({...novoUsuario, extra: e.target.value})} className="bg-[#343541] border border-purple-500/50 rounded p-2 text-sm text-white" />
                                            <button type="submit" disabled={criando} className="bg-purple-600 hover:bg-purple-500 text-white font-bold rounded p-2 transition">Criar Cientista</button>
                                        </form>
                                    </div>

                                    <div className="bg-[#202123] rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                                        <div className="p-4 bg-gray-800/50 border-b border-gray-700"><h3 className="font-bold text-white">Equipa de Investigação AI</h3></div>
                                        <table className="w-full text-left text-sm text-gray-300">
                                            <thead className="bg-[#343541] text-gray-400 text-xs uppercase">
                                                <tr>
                                                    <th className="px-4 py-3">Instituição</th>
                                                    <th className="px-4 py-3">Nome</th>
                                                    <th className="px-4 py-3">Username</th>
                                                    {/* 🌟 Novas colunas de Status */}
                                                    <th className="px-4 py-3">Status</th>
                                                    <th className="px-4 py-3">Último Login</th>
                                                    <th className="px-4 py-3 text-right">Ação</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dados.cientistas?.map(c => (
                                                    <tr key={c.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                                                        <td className="px-4 py-3 font-mono text-purple-400">{c.instituicao || 'N/A'}</td>
                                                        <td className="px-4 py-3 font-bold text-white">{c.nome}</td>
                                                        <td className="px-4 py-3 text-gray-400">@{c.username}</td>
                                                        {/* 🌟 Bolinha de status online/offline */}
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 w-fit ${c.isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                                <span className={`w-2 h-2 rounded-full ${c.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}></span>
                                                                {c.isOnline ? 'Online' : 'Offline'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-gray-400">{c.ultimoLogin ? new Date(c.ultimoLogin).toLocaleString('pt-BR') : 'Nunca'}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <button onClick={() => handleDeletar('cientista', c.id, c.nome)} className="px-3 py-1 bg-red-900/30 hover:bg-red-600 text-red-500 hover:text-white rounded transition text-xs font-bold">Apagar</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* ABA: CONSULTAS */}
                            {abaAtiva === 'consultas' && (
                                <div className="bg-[#202123] rounded-xl border border-gray-700 shadow-lg overflow-hidden border-t-4 border-t-orange-500">
                                    <div className="p-4 bg-gray-800/50 border-b border-gray-700"><h3 className="font-bold text-white">Gestão de Consultas (Destrutivo)</h3></div>
                                    <table className="w-full text-left text-sm text-gray-300">
                                        <thead className="bg-[#343541] text-gray-400 text-xs uppercase">
                                            <tr>
                                                <th className="px-4 py-3">ID Consulta</th>
                                                <th className="px-4 py-3">Paciente (Queixa)</th>
                                                <th className="px-4 py-3">Médico</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3 text-right">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dados.consultas?.map(c => (
                                                <tr key={c.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                                                    <td className="px-4 py-3 font-mono text-xs">{c.id.substring(0,8)}</td>
                                                    <td className="px-4 py-3 font-bold text-white">{c.nome_paciente || (c.paciente && c.paciente.nome) || 'Desconhecido'}</td>
                                                    <td className="px-4 py-3 text-gray-400">{c.medico ? `Dr. ${c.medico.nome}` : 'Nenhum'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${c.status === 'finalizada' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                            {c.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button onClick={() => handleDeletar('consulta', c.id, `Consulta ID: ${c.id.substring(0,8)}`)} className="px-3 py-1 bg-red-900/30 hover:bg-red-600 text-red-500 hover:text-white rounded transition text-xs font-bold">Forçar Apagar</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;