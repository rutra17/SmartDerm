import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';

function Register() {
    const navigate = useNavigate();
    const [tipoConta, setTipoConta] = useState('paciente');
    const [identificador, setIdentificador] = useState('');
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [senha, setSenha] = useState('');
    const [codigoAutorizacao, setCodigoAutorizacao] = useState(''); // O segredo para médicos/cientistas
    const [loading, setLoading] = useState(false);

    // --- CHAVES DE SEGURANÇA SEPARADAS POR CARGO ---
    const CHAVE_MEDICO = "MEDICO2026";
    const CHAVE_CIENTISTA = "DATAADMIN2026";

    const aplicarMascaraCPF = (valor) => {
        return valor.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
    };

    const handleIdentificadorChange = (e) => {
        let valor = e.target.value;
        if (tipoConta === 'paciente') valor = aplicarMascaraCPF(valor);
        else if (tipoConta === 'medico') valor = valor.replace(/\D/g, '').substring(0, 8);
        setIdentificador(valor);
    };

    const handleCadastro = async (e) => {
        e.preventDefault();

        // 1. Verificação de Segurança Rigorosa por Cargo
        if (tipoConta === 'medico' && codigoAutorizacao !== CHAVE_MEDICO) {
            alert("❌ Código de Médico inválido! Solicite o token correto à administração.");
            return;
        }
        
        if (tipoConta === 'cientista' && codigoAutorizacao !== CHAVE_CIENTISTA) {
            alert("❌ Código de Pesquisador/Cientista inválido! Acesso negado.");
            return;
        }

        setLoading(true);
        let emailMontado = "";

        // 2. Montagem do Email do Supabase
        if (tipoConta === 'paciente') {
            const cpf = identificador.replace(/\D/g, '');
            if (cpf.length !== 11) { alert("CPF incompleto!"); setLoading(false); return; }
            emailMontado = `${cpf}@paciente.smartderm.com`;
        } else if (tipoConta === 'medico') {
            emailMontado = `${identificador}@medico.smartderm.com`;
        } else if (tipoConta === 'cientista') {
            const user = identificador.toLowerCase().replace(/\s/g, '_');
            emailMontado = `${user}@cientista.smartderm.com`;
        }

        // 3. Cadastrar no Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: emailMontado,
            password: senha,
            options: {
                data: {
                    nome: nomeCompleto,
                    tipo_conta: tipoConta
                }
            }
        });

        if (error) {
            console.error("Erro no cadastro:", error);
            alert("Erro ao criar conta. Talvez este utilizador já exista.");
            setLoading(false);
            return;
        }

        alert(`✅ Conta de ${tipoConta.toUpperCase()} criada com sucesso! Já pode fazer o login.`);
        navigate('/');
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#202123] flex flex-col items-center justify-center p-4 font-sans">
            <div className="bg-[#343541] w-full max-w-md rounded-2xl shadow-2xl p-8 border border-gray-700">
                
                <h2 className="text-2xl font-bold text-white mb-2 text-center">Novo Registo</h2>
                <p className="text-gray-400 text-sm text-center mb-6">Crie a sua conta no SmartDerm AI</p>

                <form onSubmit={handleCadastro} className="space-y-4">
                    
                    {/* Seletor do Tipo de Conta */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Tipo de Conta</label>
                        <select 
                            value={tipoConta} 
                            onChange={(e) => { setTipoConta(e.target.value); setIdentificador(''); setCodigoAutorizacao(''); }}
                            className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500 transition"
                        >
                            <option value="paciente">👤 Paciente</option>
                            <option value="medico">🩺 Médico Especialista</option>
                            <option value="cientista">🔬 Cientista de Dados (Pesquisa)</option>
                        </select>
                    </div>

                    {/* Código de Segurança Dinâmico (Só aparece se for médico ou cientista) */}
                    {tipoConta !== 'paciente' && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg animate-fade-in">
                            <label className="block text-xs text-red-400 mb-1 font-semibold uppercase">
                                Código de Autorização ({tipoConta === 'medico' ? 'Médico' : 'Pesquisa'})
                            </label>
                            <input 
                                type="password" required value={codigoAutorizacao} onChange={(e) => setCodigoAutorizacao(e.target.value)}
                                placeholder={`Insira a chave de ${tipoConta}...`}
                                className="w-full bg-[#40414F] border border-red-500/50 rounded p-2 text-white focus:outline-none focus:border-red-500"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Nome Completo</label>
                        <input 
                            type="text" required value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} placeholder="João Silva"
                            className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">
                            {tipoConta === 'paciente' ? 'CPF' : tipoConta === 'medico' ? 'Registro CRN/CRM' : 'Nome de Usuário (ID)'}
                        </label>
                        <input 
                            type="text" required value={identificador} onChange={handleIdentificadorChange}
                            placeholder={tipoConta === 'paciente' ? '000.000.000-00' : tipoConta === 'medico' ? 'Apenas números' : 'Ex: admin_bruno'}
                            className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Senha de Acesso</label>
                        <input 
                            type="password" required minLength="6" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo de 6 caracteres"
                            className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    <button 
                        type="submit" disabled={loading}
                        className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold text-lg shadow-lg transition"
                    >
                        {loading ? 'A registar...' : 'Criar Conta'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/" className="text-sm text-gray-400 hover:text-white transition">
                        ← Voltar para o Login
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default Register;