import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// IMPORTANTE: Importando a conexão com o banco de dados
import { supabase } from '../services/supabase';

export default function Register() {
    const navigate = useNavigate();
    
    // Estados para guardar o que o usuário digita
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    
    // Estado para controlar o botão de carregamento
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (senha !== confirmarSenha) {
            alert("As senhas não coincidem!");
            return;
        }

        if (nome && cpf && senha) {
            setLoading(true);

            // Truque Arquitetural: Transformando o CPF em um "e-mail" para o Supabase Auth
            const cpfNumeros = cpf.replace(/\D/g, ''); // Remove pontos e traços
            const emailFalso = `${cpfNumeros}@paciente.smartderm.com`;

            try {
                // Comando oficial do Supabase para criar um usuário
                const { data, error } = await supabase.auth.signUp({
                    email: emailFalso,
                    password: senha,
                    options: {
                        data: {
                            nome_completo: nome,
                            cpf_real: cpf,
                            perfil: 'paciente'
                        }
                    }
                });

                if (error) {
                    throw error;
                }

                console.log("✅ Usuário cadastrado no Supabase:", data);
                alert("Cadastro realizado com sucesso! Você já pode fazer login.");
                
                // Redireciona o usuário de volta para a tela inicial após o sucesso
                navigate('/');

            } catch (error) {
                console.error("❌ Erro no cadastro:", error.message);
                
                // Tradução rápida de alguns erros comuns
                if (error.message.includes("User already registered")) {
                    alert("Este CPF já está cadastrado no sistema.");
                } else if (error.message.includes("Password should be at least")) {
                    alert("A senha é muito fraca. Digite pelo menos 6 caracteres.");
                } else {
                    alert("Ocorreu um erro ao criar a conta: " + error.message);
                }
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#202123] flex items-center justify-center text-white p-4">
            <div className="bg-[#343541] p-8 rounded-xl border border-gray-600 w-full max-w-md shadow-xl animate-fade-in">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Criar Conta</h2>
                    <p className="text-gray-400 text-sm">Portal do Paciente</p>
                </div>

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Nome Completo</label>
                        <input 
                            type="text" 
                            required
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: João da Silva"
                            className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500 transition"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">CPF</label>
                        <input 
                            type="text" 
                            required
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            placeholder="000.000.000-00"
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
                            placeholder="Mínimo de 6 caracteres"
                            className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500 transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Confirmar Senha</label>
                        <input 
                            type="password" 
                            required
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            placeholder="Repita a senha"
                            className="w-full bg-[#40414F] border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-emerald-500 transition"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full px-4 py-3 rounded text-white font-semibold transition mt-2 ${loading ? 'bg-emerald-800 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                    >
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        Já tem uma conta? <Link to="/" className="text-emerald-500 hover:underline">Faça login aqui</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}