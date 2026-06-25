import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function InviteRegister() {
    const { token } = useParams(); // Pega o token gigante da URL
    const navigate = useNavigate();
    
    const [nome, setNome] = useState('');
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

    const handleRegistrar = async (e) => {
        e.preventDefault();
        setErro('');
        setLoading(true);

        try {
            const resposta = await fetch('https://api.smartderm.37.27.81.229.sslip.io/api/auth/registrar-convite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, nome }) 
                // Nota: O medicoId pode ser adicionado aqui futuramente se criarmos um dropdown de médicos
            });

            const dados = await resposta.json();

            if (resposta.ok) {
                // Guarda o token de sessão e entra direto!
                localStorage.setItem('token', dados.token);
                alert('Conta criada com sucesso! Bem-vindo ao SmartDerm.');
                navigate('/paciente'); // Mude para a rota do dashboard do paciente se for diferente
            } else {
                setErro(`${dados.erro || "Erro ao processar o convite."}`);
            }
        } catch (error) {
            setErro("Erro de conexão com o servidor.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#202123] flex flex-col items-center justify-center p-4 font-sans">
            <div className="bg-[#343541] w-full max-w-md rounded-2xl shadow-2xl p-8 border border-emerald-500/30">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
                        ✉️
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Convite Especial</h2>
                    <p className="text-gray-400 text-sm">Você foi convidado para o SmartDerm AI. Informe o seu nome para começar.</p>
                </div>

                {erro && <div className="mb-6 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm text-center">{erro}</div>}

                <form onSubmit={handleRegistrar} className="space-y-6">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1 font-semibold uppercase">O seu Nome Completo</label>
                        <input 
                            type="text" required value={nome} onChange={(e) => setNome(e.target.value)} 
                            placeholder="Ex: Maria Joana da Silva"
                            className="w-full bg-[#40414F] border border-gray-600 rounded p-4 text-white focus:outline-none focus:border-emerald-500 text-lg transition"
                        />
                    </div>

                    <button 
                        type="submit" disabled={loading}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold text-lg shadow-lg transition disabled:opacity-50"
                    >
                        {loading ? 'A preparar o seu acesso...' : 'Aceder à Plataforma'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default InviteRegister;