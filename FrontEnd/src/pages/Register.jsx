import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const navigate = useNavigate();
    
    // --- ESTADOS DA CONTA ---
    const [tipoConta, setTipoConta] = useState('paciente');
    const [identificador, setIdentificador] = useState('');
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [email, setEmail] = useState(''); // NOVO ESTADO: E-mail real
    const [senha, setSenha] = useState('');
    const [codigoAutorizacao, setCodigoAutorizacao] = useState('');
    const [genero, setGenero] = useState('');
    
    // --- ESTADOS DO ENDEREÇO ---
    const [cep, setCep] = useState('');
    const [rua, setRua] = useState('');
    const [numero, setNumero] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [referencia, setReferencia] = useState(''); 
    const [cepStatus, setCepStatus] = useState(''); 

    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(''); 

    // --- CHAVES DE SEGURANÇA ---
    const CHAVE_MEDICO = "MEDICO2026";
    const CHAVE_CIENTISTA = "DATAADMIN2026";

    // ==========================================
    // 1. MÁSCARAS E FORMATAÇÕES
    // ==========================================
    const aplicarMascaraCPF = (valor) => {
        return valor.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
    };

    const handleIdentificadorChange = (e) => {
        let valor = e.target.value;
        if (tipoConta === 'paciente') valor = aplicarMascaraCPF(valor);
        else if (tipoConta === 'medico') valor = valor.replace(/\D/g, '').substring(0, 8);
        setIdentificador(valor);
    };

    // ==========================================
    // 2. BUSCA INTELIGENTE DE CEP (ViaCEP)
    // ==========================================
    const handleCepChange = async (e) => {
        let valor = e.target.value;
        const cepLimpo = valor.replace(/\D/g, '');
        
        if (cepLimpo.length > 5) {
            valor = cepLimpo.replace(/^(\d{5})(\d)/, "$1-$2");
        } else {
            valor = cepLimpo;
        }
        
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

            } catch (error) {
                setCepStatus('❌ Erro na busca');
            }
        } else {
            setCepStatus('');
        }
    };

    // ==========================================
    // 3. REGISTO NO NOSSO BACK-END (PRISMA)
    // ==========================================
    const handleCadastro = async (e) => {
        e.preventDefault();
        setErro('');

        if (tipoConta === 'medico' && codigoAutorizacao !== CHAVE_MEDICO) {
            setErro("❌ Código de Médico inválido! Solicite o token correto."); return;
        }
        if (tipoConta === 'cientista' && codigoAutorizacao !== CHAVE_CIENTISTA) {
            setErro("❌ Código de Cientista inválido! Acesso negado."); return;
        }

        setLoading(true);
        let usernameFinal = "";

        if (tipoConta === 'paciente') {
            const cpf = identificador.replace(/\D/g, '');
            if (cpf.length !== 11) { setErro("CPF incompleto!"); setLoading(false); return; }
            usernameFinal = cpf;
        } else if (tipoConta === 'medico') {
            usernameFinal = identificador.replace(/\D/g, '');
        } else if (tipoConta === 'cientista') {
            usernameFinal = identificador.toLowerCase().replace(/\s/g, '_');
        }

        const enderecoCompleto = `${rua}, ${numero} - ${bairro}, ${cidade} - ${estado}`;

        // Pacote de dados atualizado com o E-mail real do estado
        const payload = {
            username: usernameFinal,
            senha: senha,
            nome: nomeCompleto,
            email: email, // Agora enviamos o e-mail que o utilizador digitou
            tipo: tipoConta,
            dadoEspecifico: identificador,
            genero: genero,
            cep: cep,
            endereco: enderecoCompleto,
            referencia: referencia
        };

        try {
            const resposta = await fetch('http://localhost:3000/api/auth/registar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                setErro(`❌ ${dados.erro || "Erro ao criar conta."}`);
                setLoading(false);
                return;
            }

            alert(`✅ Conta de ${tipoConta.toUpperCase()} criada com sucesso!`);
            navigate('/');
            
        } catch (error) {
            console.error("Erro no cadastro:", error);
            setErro("❌ Erro ao conectar com o servidor.");
        }

        setLoading(false);
    };

    // ==========================================
    // 4. RENDERIZAÇÃO DA INTERFACE
    // ==========================================
    return (
        <div className="min-h-screen bg-[#202123] flex flex-col items-center justify-center p-4 font-sans py-10">
            <div className="bg-[#343541] w-full max-w-2xl rounded-2xl shadow-2xl p-8 border border-gray-700">
                
                <h2 className="text-2xl font-bold text-white mb-2 text-center">Novo Registo</h2>
                <p className="text-gray-400 text-sm text-center mb-6">Crie a sua conta no SmartDerm AI</p>

                {erro && <div className="mb-4 p-3 bg-red-900 border border-red-500 text-red-100 rounded text-sm text-center">{erro}</div>}

                <form onSubmit={handleCadastro} className="space-y-5">
                    
                    {/* TIPO DE CONTA E CHAVE DE SEGURANÇA */}
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
                            <div className="animate-fade-in">
                                <label className="block text-xs text-red-400 mb-1 font-semibold uppercase">
                                    Token de {tipoConta === 'medico' ? 'Médico' : 'Pesquisa'}
                                </label>
                                <input 
                                    type="password" required value={codigoAutorizacao} onChange={(e) => setCodigoAutorizacao(e.target.value)}
                                    placeholder="Insira a chave de acesso..."
                                    className="w-full bg-red-500/10 border border-red-500/50 rounded p-3 text-white focus:outline-none focus:border-red-500"
                                />
                            </div>
                        ) : <div className="hidden md:block"></div>}
                    </div>

                    {/* DADOS PESSOAIS - Modificado para incluir E-mail */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Nome Completo</label>
                        <input 
                            type="text" required value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} placeholder="Ex: João da Silva"
                            className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">E-mail Real</label>
                            <input 
                                type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.email@exemplo.com"
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

                    {/* IDENTIFICAÇÃO E SENHA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>

                    <hr className="border-gray-700 my-4" />
                    
                    <h3 className="text-sm font-semibold text-emerald-500 mb-2">Dados de Endereço</h3>

                    {/* ENDEREÇO LINHA 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">CEP</label>
                            <input 
                                type="text" required maxLength="9" value={cep} onChange={handleCepChange} placeholder="00000-000"
                                className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
                            />
                            {cepStatus && <span className="absolute right-3 top-[34px] text-xs font-semibold text-gray-300">{cepStatus}</span>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Rua / Logradouro</label>
                            <input 
                                type="text" required value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Avenida Brasil"
                                className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                    </div>

                    {/* ENDEREÇO LINHA 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Número</label>
                            <input 
                                id="numero-input" type="text" required value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="123"
                                className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Bairro</label>
                            <input 
                                type="text" required value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Centro"
                                className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Cidade / UF</label>
                            <input 
                                type="text" required value={cidade ? `${cidade} - ${estado}` : ''} readOnly placeholder="São Paulo - SP"
                                className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-gray-400 cursor-not-allowed outline-none"
                            />
                        </div>
                    </div>

                    {/* ENDEREÇO LINHA 3: PONTO DE REFERÊNCIA */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">Ponto de Referência</label>
                        <input 
                            type="text" value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ex: Próximo ao supermercado, em frente à praça..."
                            className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500"
                        />
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