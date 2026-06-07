import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { supabase } from './services/supabase';

// Importação das suas páginas
import PatientChat from './pages/PatientChat';
import DoctorPanel from './pages/DoctorPanel';
import ScientistDashboard from './pages/ScientistDashboard';
import Register from './pages/Register';
import Home from './pages/Home';

// Importação do Componente de Segurança (Garanta que o caminho está correto)
import ProtectedRoute from './components/ProtectedRoute'; 

// ========================================================
// COMPONENTE DE LOGIN (Manteve-se a sua lógica perfeita)
// ========================================================
function HomeGateway() {
    const navigate = useNavigate();
    const [loginType, setLoginType] = useState(null); 
    const [identificador, setIdentificador] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    // --- 1. VALIDADOR MATEMÁTICO DE CPF REAL ---
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

    // --- 2. LOGIN UNIFICADO E SEGURO COM O SUPABASE ---
    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!identificador || !senha) {
            alert("Por favor, preencha o seu identificador e a senha."); return;
        }

        setLoading(true);
        let emailMontado = "";

        if (loginType === 'paciente') {
            const cpfNumeros = identificador.replace(/\D/g, ''); 
            if (!validarCPF(cpfNumeros)) {
                alert("❌ O CPF introduzido não é válido matematicamente.");
                setLoading(false); return;
            }
            emailMontado = `${cpfNumeros}@paciente.smartderm.com`;
        } 
        else if (loginType === 'medico') {
            const crmNumeros = identificador.replace(/\D/g, '');
            emailMontado = `${crmNumeros}@medico.smartderm.com`;
        } 
        else if (loginType === 'cientista') {
            const userFormatado = identificador.toLowerCase().replace(/\s/g, '_');
            emailMontado = `${userFormatado}@cientista.smartderm.com`;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: emailMontado,
            password: senha,
        });

        if (error) {
            console.error("Erro no login:", error.message);
            alert("❌ Credenciais incorretas ou utilizador não registado.");
            setLoading(false);
            return;
        }

        console.log(`✅ Login de ${loginType} realizado com sucesso!`);
        if (loginType === 'paciente') navigate('/paciente');
        else if (loginType === 'medico') navigate('/medico');
        else if (loginType === 'cientista') navigate('/cientista');

        setLoading(false);
    };

    const renderLoginForm = (title, labelID, placeholderID) => (
        <div className="bg-[#343541] p-8 rounded-xl border border-gray-600 w-full max-w-md shadow-xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">{title}</h2>
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
                    <button type="button" onClick={() => { setLoginType(null); setIdentificador(''); setSenha(''); }} className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded text-white font-semibold transition">
                        Voltar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        aria-busy={loading}
                        className={`flex-1 px-4 py-3 rounded text-white font-semibold transition flex items-center justify-center gap-2 ${loading ? 'bg-emerald-800 cursor-not-allowed' : 'bg-smart-mint hover:bg-emerald-500'}`}>
                        {loading ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" aria-hidden="true" />
                                <span>Entrando...</span>
                            </>
                        ) : (
                            'Entrar'
                        )}
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

            {loginType === 'paciente' && renderLoginForm("Login do Paciente", "CPF (Apenas números válidos)", "000.000.000-00")}
            {loginType === 'medico' && renderLoginForm("Portal Médico", "Registro CRN/CRM", "Ex: 12345")}
            {loginType === 'cientista' && renderLoginForm("Painel do Analista", "Nome de Usuário", "Ex: bruno_admin")}
        </div>
    );
}

// ========================================================
// DEFINIÇÃO DAS ROTAS COM SEGURANÇA (ProtectedRoute)
// ========================================================
function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ROTAS PÚBLICAS */}
                <Route path="/" element={<Home />} />
                <Route path="/cadastro" element={<Register />} /> 
                <Route path="/login" element={<HomeGateway />} />
                
                {/* ROTAS PROTEGIDAS */}
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
            </Routes>
        </BrowserRouter>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);