import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';

// IMPORTANTE: Importando a conexão com o banco de dados para o Login
import { supabase } from './services/supabase';

// Importando as 4 páginas
import PatientChat from './pages/PatientChat';
import DoctorPanel from './pages/DoctorPanel';
import ScientistDashboard from './pages/ScientistDashboard';
import Register from './pages/Register';

// A Página Inicial com Formulários de Login
function HomeGateway() {
    const navigate = useNavigate();
    
    // Estados do formulário
    const [loginType, setLoginType] = useState(null); 
    const [identificador, setIdentificador] = useState('');
    const [senha, setSenha] = useState('');
    
    // Novo estado para o botão mostrar que está carregando
    const [loading, setLoading] = useState(false);

    // FUNÇÃO DE LOGIN ATUALIZADA COM O SUPABASE
    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (identificador && senha) {
            setLoading(true);

            if (loginType === 'paciente') {
                // 1. Refaz o truque do e-mail falso usando o CPF digitado
                const cpfNumeros = identificador.replace(/\D/g, ''); 
                const emailFalso = `${cpfNumeros}@paciente.smartderm.com`;

                // 2. Pergunta ao Supabase se a senha está correta
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: emailFalso,
                    password: senha,
                });

                if (error) {
                    console.error("❌ Erro no login:", error.message);
                    alert("CPF ou senha incorretos! Tente novamente.");
                    setLoading(false);
                    return;
                }

                // 3. Se passou, libera a entrada para o chat!
                console.log("✅ Login realizado com sucesso!", data.user);
                navigate('/paciente');

            } else {
                // Para o Médico e Cientista, como ainda não criamos o cadastro deles, mostramos um aviso
                alert(`O sistema de login para ${loginType} está em construção!`);
            }

            setLoading(false);
        } else {
            alert("Por favor, preencha o seu identificador e a senha.");
        }
    };

    const renderLoginForm = (title, labelID, placeholderID) => (
        <div className="bg-[#343541] p-8 rounded-xl border border-gray-600 w-full max-w-md shadow-xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">{title}</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">{labelID}</label>
                    <input 
                        type="text" 
                        required
                        value={identificador}
                        onChange={(e) => setIdentificador(e.target.value)}
                        placeholder={placeholderID}
                        className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Senha</label>
                    <input 
                        type="password" 
                        required
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500 transition"
                    />
                </div>
                
                <div className="flex gap-3 mt-4">
                    <button 
                        type="button" 
                        onClick={() => { setLoginType(null); setIdentificador(''); setSenha(''); }}
                        className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded text-white font-semibold transition"
                    >
                        Voltar
                    </button>
                    <button 
                        type="submit"
                        disabled={loading}
                        className={`flex-1 px-4 py-3 rounded text-white font-semibold transition ${loading ? 'bg-emerald-800 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </div>

                {/* Link para criar conta apenas para o Paciente */}
                {title === "Login do Paciente" && (
                    <div className="mt-4 text-center">
                        <Link to="/cadastro" className="text-sm text-emerald-500 hover:underline">
                            Não tem conta? Cadastre-se aqui
                        </Link>
                    </div>
                )}
            </form>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#202123] flex flex-col items-center justify-center text-white p-4">
            <h1 className="text-4xl font-bold text-emerald-500 mb-2">SmartDerm AI</h1>
            <p className="text-gray-400 mb-10 text-center">Acesso restrito. Autentique-se para continuar.</p>
            
            {!loginType && (
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
            )}

            {loginType === 'paciente' && renderLoginForm("Login do Paciente", "CPF", "000.000.000-00")}
            {loginType === 'medico' && renderLoginForm("Portal Médico", "Registro CRN/CRM", "Ex: 12345-SP")}
            {loginType === 'cientista' && renderLoginForm("Painel do Analista", "Nome de Usuário", "admin_username")}
        </div>
    );
}

// O Roteador Principal
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomeGateway />} />
                <Route path="/cadastro" element={<Register />} /> 
                <Route path="/paciente" element={<PatientChat />} />
                <Route path="/medico" element={<DoctorPanel />} />
                <Route path="/cientista" element={<ScientistDashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);