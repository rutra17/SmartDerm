import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';

// Importação das suas páginas
import Home from './pages/Home';
import PatientChat from './pages/PatientChat';
import DoctorPanel from './pages/DoctorPanel';
import ScientistDashboard from './pages/ScientistDashboard';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

// Importação do Componente de Segurança
import ProtectedRoute from './components/ProtectedRoute'; 

function HomeGateway() {
    const navigate = useNavigate();
    const [loginType, setLoginType] = useState(null); 
    const [identificador, setIdentificador] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

    // --- 1. VALIDADOR MATEMÁTICO DE CPF REAL (Mantido intacto) ---
    const validarCPF = (cpf) => {
        cpf = cpf.replace(/[^\d]+/g, ''); 
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false; 
        
        let soma = 0, resto;
        for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;
        
        soma = 0;
        for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;
        
        return true;
    };

    const aplicarMascaraCPF = (valor) => {
        return valor.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
    };

    const aplicarMascaraNumerica = (valor) => valor.replace(/\D/g, '').substring(0, 8);

    const handleIdentificadorChange = (e) => {
        let valorDigitado = e.target.value;
        if (loginType === 'paciente') valorDigitado = aplicarMascaraCPF(valorDigitado);
        else if (loginType === 'medico') valorDigitado = aplicarMascaraNumerica(valorDigitado);
        setIdentificador(valorDigitado);
    };

    // --- 2. NOVO LOGIN COM O NOSSO BACK-END (JWT) ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setErro('');
        
        if (!identificador || !senha) {
            setErro("Por favor, preencha o seu identificador e a senha."); 
            return;
        }

        setLoading(true);
        let usernameFinal = "";

        // Formata o username consoante o tipo selecionado
        if (loginType === 'paciente') {
            const cpfNumeros = identificador.replace(/\D/g, ''); 
            if (!validarCPF(cpfNumeros)) {
                setErro("❌ O CPF introduzido não é válido.");
                setLoading(false); return;
            }
            usernameFinal = cpfNumeros; // O back-end guardou o username limpo
        } 
        else if (loginType === 'medico') {
            usernameFinal = identificador.replace(/\D/g, ''); // Ex: CRM limpo
        } 
        else if (loginType === 'cientista') {
            usernameFinal = identificador.toLowerCase().replace(/\s/g, '_');
        }
        // 🌟 NOVA REGRA PARA O ADMIN
        else if (loginType === 'admin') {
            usernameFinal = identificador; 
        }

        try {
            // Chamada à nossa API!
            const resposta = await fetch('https://api.smartderm.37.27.81.229.sslip.io/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameFinal, senha })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                setErro(`❌ ${dados.erro || "Credenciais incorretas."}`);
                setLoading(false);
                return;
            }

            console.log(`✅ Login de ${dados.usuario.tipo} realizado com sucesso!`);
            
            // Guarda o Token e os dados do utilizador no cofre do navegador
            localStorage.setItem('token', dados.token);
            localStorage.setItem('usuario', JSON.stringify(dados.usuario));

            // Redirecionamento baseado na resposta do Back-End
            if (dados.usuario.tipo === 'paciente') navigate('/paciente');
            else if (dados.usuario.tipo === 'medico') navigate('/medico');
            else if (dados.usuario.tipo === 'cientista') navigate('/cientista');
            else if (dados.usuario.tipo === 'admin') navigate('/admin'); // 🌟 REDIRECIONAMENTO DO ADMIN

        } catch (error) {
            console.error("Erro na comunicação:", error);
            setErro("❌ Erro ao conectar com o servidor.");
        }

        setLoading(false);
    };

    const renderLoginForm = (title, labelID, placeholderID) => (
        <div className="bg-[#343541] p-8 rounded-xl border border-gray-600 w-full max-w-md shadow-xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">{title}</h2>
            
            {/* Exibe o erro visualmente caso exista */}
            {erro && <div className="mb-4 p-3 bg-red-900 border border-red-500 text-red-100 rounded text-sm text-center">{erro}</div>}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">{labelID}</label>
                    <input 
                        type="text" required value={identificador} onChange={handleIdentificadorChange} placeholder={placeholderID}
                        className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Senha</label>
                    <input 
                        type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••"
                        className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                </div>
                
                <div className="flex gap-3 mt-4">
                    <button type="button" onClick={() => { setLoginType(null); setIdentificador(''); setSenha(''); setErro(''); }} className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded text-white font-semibold transition">
                        Voltar
                    </button>
                    <button type="submit" disabled={loading} className={`flex-1 px-4 py-3 rounded text-white font-semibold transition ${loading ? 'bg-emerald-800 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500'}`}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <Link to="/cadastro" className="text-sm text-emerald-500 hover:underline">
                        Não tem conta? Cadastre-se aqui
                    </Link>
                </div>
            </form>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#202123] flex flex-col items-center justify-center text-white p-4 relative">
            <h1 className="text-4xl font-bold text-emerald-500 mb-2">SmartDerm AI</h1>
            <p className="text-gray-400 mb-10 text-center">Acesso restrito. Autentique-se para continuar.</p>
            
            {!loginType && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                        <button onClick={() => setLoginType('paciente')} className="bg-[#343541] p-8 rounded-xl border border-gray-600 hover:border-emerald-500 hover:shadow-lg transition flex flex-col items-center text-center group cursor-pointer">
                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">👤</span>
                            <h2 className="text-xl font-bold mb-2">Sou Paciente</h2>
                            <p className="text-sm text-gray-400">Acessar via CPF</p>
                        </button>
                        <button onClick={() => setLoginType('medico')} className="bg-[#343541] p-8 rounded-xl border border-gray-600 hover:border-blue-500 hover:shadow-lg transition flex flex-col items-center text-center group cursor-pointer">
                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🩺</span>
                            <h2 className="text-xl font-bold mb-2">Sou Médico</h2>
                            <p className="text-sm text-gray-400">Acessar via CRN/CRM</p>
                        </button>
                        <button onClick={() => setLoginType('cientista')} className="bg-[#343541] p-8 rounded-xl border border-gray-600 hover:border-purple-500 hover:shadow-lg transition flex flex-col items-center text-center group cursor-pointer">
                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📊</span>
                            <h2 className="text-xl font-bold mb-2">Cientista de Dados</h2>
                            <p className="text-sm text-gray-400">Acesso Administrativo</p>
                        </button>
                    </div>

                    {/* 🌟 BOTÃO SECRETO DO ADMINISTRADOR (FIXADO NO CANTO INFERIOR DIREITO) */}
                    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
                        <button 
                            type="button"
                            onClick={() => { setLoginType('admin'); setIdentificador(''); setSenha(''); setErro(''); }}
                            style={{
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                padding: '12px 20px', 
                                backgroundColor: '#cc0000', 
                                border: '2px solid #ffcccc', 
                                borderRadius: '8px',
                                color: 'white', 
                                fontSize: '14px', 
                                fontWeight: 'bold',
                                cursor: 'pointer', 
                                textTransform: 'uppercase',
                                boxShadow: '0 10px 15px rgba(0,0,0,0.3)'
                            }}
                        >
                            SysAdmin
                        </button>
                    </div>
                </>
            )}

            {loginType === 'paciente' && renderLoginForm("Login do Paciente", "CPF (Apenas números válidos)", "000.000.000-00")}
            {loginType === 'medico' && renderLoginForm("Portal Médico", "Registro CRN/CRM", "Ex: 12345")}
            {loginType === 'cientista' && renderLoginForm("Painel do Analista", "Nome de Usuário", "Ex: username_lastname")}
            {loginType === 'admin' && renderLoginForm("Acesso Supremo (SysAdmin)", "Nome de Usuário", "Ex: admin")}
        </div>
    );
}

// ========================================================
// DEFINIÇÃO DAS ROTAS
// ========================================================
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<HomeGateway />} />
                <Route path="/cadastro" element={<Register />} /> 
                
                <Route path="/paciente" element={
                    <ProtectedRoute allowedRoles={['paciente']}>
                        <PatientChat />
                    </ProtectedRoute>
                } />
                <Route path="/medico" element={
                    <ProtectedRoute allowedRoles={['medico']}>
                        <DoctorPanel />
                    </ProtectedRoute>
                } />
                <Route path="/cientista" element={
                    <ProtectedRoute allowedRoles={['cientista']}>
                        <ScientistDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);