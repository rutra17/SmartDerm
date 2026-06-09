import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRegister } from '../services/api';

function Register() {
    const navigate = useNavigate();

    const [tipoConta, setTipoConta] = useState('paciente');
    const [identificador, setIdentificador] = useState('');
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [senha, setSenha] = useState('');
    const [codigoAutorizacao, setCodigoAutorizacao] = useState('');
    const [genero, setGenero] = useState('');

    const [cep, setCep] = useState('');
    const [rua, setRua] = useState('');
    const [numero, setNumero] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [cepStatus, setCepStatus] = useState('');

    const [loading, setLoading] = useState(false);

    const aplicarMascaraCPF = (valor) =>
        valor.replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');

    const handleIdentificadorChange = (e) => {
        let valor = e.target.value;
        if (tipoConta === 'paciente') valor = aplicarMascaraCPF(valor);
        else if (tipoConta === 'medico') valor = valor.replace(/\D/g, '').substring(0, 8);
        setIdentificador(valor);
    };

    const handleCepChange = async (e) => {
        let valor = e.target.value;
        const cepLimpo = valor.replace(/\D/g, '');
        valor = cepLimpo.length > 5 ? cepLimpo.replace(/^(\d{5})(\d)/, "$1-$2") : cepLimpo;
        setCep(valor);

        if (cepLimpo.length === 8) {
            try {
                setCepStatus('⏳ A procurar...');
                const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
                const data = await response.json();

                if (data.erro) {
                    setCepStatus('❌ CEP inválido');
                    setRua(''); setBairro(''); setCidade(''); setEstado('');
                    return;
                }

                setRua(data.logradouro);
                setBairro(data.bairro);
                setCidade(data.localidade);
                setEstado(data.uf);
                setCepStatus('✅ Encontrado');
                document.getElementById('numero-input')?.focus();
            } catch {
                setCepStatus('❌ Erro na busca');
            }
        } else {
            setCepStatus('');
        }
    };

    const handleCadastro = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const enderecoCompleto = `${rua}, ${numero} - ${bairro}, ${cidade} - ${estado}, CEP: ${cep}`;

            const data = await apiRegister({
                nome: nomeCompleto,
                tipo_conta: tipoConta,
                identificador,
                senha,
                genero,
                endereco: enderecoCompleto,
                codigo_autorizacao: codigoAutorizacao,
            });

            if (data.error) {
                alert("❌ " + data.error);
                return;
            }

            alert(`✅ Conta de ${tipoConta.toUpperCase()} criada com sucesso! Já pode fazer o login.`);
            navigate('/');
        } catch (err) {
            alert("❌ Erro de conexão com o servidor. Tente novamente.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#202123] flex flex-col items-center justify-center p-4 font-sans py-10">
            <div className="bg-[#343541] w-full max-w-2xl rounded-2xl shadow-2xl p-8 border border-gray-700">

                <h2 className="text-2xl font-bold text-white mb-2 text-center">Novo Registo</h2>
                <p className="text-gray-400 text-sm text-center mb-6">Crie a sua conta no SmartDerm AI</p>

                <form onSubmit={handleCadastro} className="space-y-5">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Tipo de Conta</label>
                            <select
                                value={tipoConta}
                                onChange={(e) => { setTipoConta(e.target.value); setIdentificador(''); setCodigoAutorizacao(''); }}
                                className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500 transition"
                            >
                                <option value="paciente">👤 Paciente</option>
                                <option value="medico">🩺 Médico Especialista</option>
                                <option value="cientista">🔬 Cientista de Dados</option>
                            </select>
                        </div>

                        {tipoConta !== 'paciente' ? (
                            <div>
                                <label className="block text-xs text-red-400 mb-1 font-semibold uppercase">
                                    Token de {tipoConta === 'medico' ? 'Médico' : 'Pesquisa'}
                                </label>
                                <input
                                    type="password" required value={codigoAutorizacao}
                                    onChange={(e) => setCodigoAutorizacao(e.target.value)}
                                    placeholder="Insira a chave de acesso..."
                                    className="w-full bg-red-500/10 border border-red-500/50 rounded p-3 text-white focus:outline-none focus:border-red-500"
                                />
                            </div>
                        ) : <div className="hidden md:block"></div>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Nome Completo</label>
                            <input
                                type="text" required value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)}
                                placeholder="Ex: João da Silva"
                                className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Gênero</label>
                            <select
                                required value={genero} onChange={(e) => setGenero(e.target.value)}
                                className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
                            >
                                <option value="">Selecione...</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Outro">Outro</option>
                                <option value="Prefiro nao informar">Prefiro não informar</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">
                                {tipoConta === 'paciente' ? 'CPF' : tipoConta === 'medico' ? 'Registro CRN/CRM' : 'Nome de Usuário'}
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
                                type="password" required minLength="6" value={senha}
                                onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo de 6 caracteres"
                                className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    <hr className="border-gray-700 my-4" />
                    <h3 className="text-sm font-semibold text-emerald-500 mb-2">Dados de Endereço</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">CEP</label>
                            <input
                                type="text" required maxLength="9" value={cep} onChange={handleCepChange}
                                placeholder="00000-000"
                                className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
                            />
                            {cepStatus && <span className="absolute right-3 top-[34px] text-xs font-semibold text-gray-300">{cepStatus}</span>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Rua / Logradouro</label>
                            <input
                                type="text" required value={rua} onChange={(e) => setRua(e.target.value)}
                                placeholder="Avenida Brasil"
                                className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Número</label>
                            <input
                                id="numero-input" type="text" required value={numero}
                                onChange={(e) => setNumero(e.target.value)} placeholder="123"
                                className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Bairro</label>
                            <input
                                type="text" required value={bairro} onChange={(e) => setBairro(e.target.value)}
                                placeholder="Centro"
                                className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Cidade / UF</label>
                            <input
                                type="text" required value={cidade ? `${cidade} - ${estado}` : ''} readOnly
                                placeholder="São Paulo - SP"
                                className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-gray-400 cursor-not-allowed outline-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit" disabled={loading}
                        className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold text-lg shadow-lg transition disabled:opacity-50"
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
