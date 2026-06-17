import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErro(''); // Limpa erros antigos antes de tentar novamente

        try {
            // Chama o nosso Back-End recém-construído!
            const resposta = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, senha }),
            });

            const dados = await resposta.json();

            // Se o servidor devolver um erro (ex: senha incorreta, usuário não existe)
            if (!resposta.ok) {
                setErro(dados.erro || 'Erro ao tentar fazer login.');
                return;
            }

            // SUCESSO! 
            // 1. Guardamos o "Crachá Digital" (Token) no cofre do navegador (LocalStorage)
            localStorage.setItem('token', dados.token);
            
            // 2. Guardamos os dados do usuário para o Front-End saber quem está logado
            localStorage.setItem('usuario', JSON.stringify(dados.usuario));

            // 3. Redirecionamento Inteligente com base no tipo de utilizador
            if (dados.usuario.tipo === 'medico') {
                navigate('/doctor-panel'); // Leva o médico para o painel dele
            } else if (dados.usuario.tipo === 'cientista') {
                navigate('/scientist-dashboard'); // Leva o cientista
            } else {
                navigate('/patient-chat'); // Leva o paciente para o chat/laudos
            }

        } catch (error) {
            console.error("Erro na comunicação com o servidor:", error);
            setErro('Erro de conexão. Verifique se o servidor está rodando.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
            <h2>Entrar no SmartDerm</h2>
            
            {erro && <div style={{ color: 'red', marginBottom: '15px' }}>{erro}</div>}
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label>Username:</label><br />
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                
                <div>
                    <label>Senha:</label><br />
                    <input 
                        type="password" 
                        value={senha} 
                        onChange={(e) => setSenha(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                
                <button type="submit" style={{ padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Entrar
                </button>
            </form>

            <p style={{ marginTop: '20px' }}>
                Ainda não tem conta? <Link to="/register">Registe-se aqui</Link>
            </p>
        </div>
    );
};

export default Login;