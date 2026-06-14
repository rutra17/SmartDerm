import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Certifique-se de ajustar o caminho relativo correto para o seu arquivo do supabase
import { supabase } from '../utils/supabaseClient'; 
import './AdminPage.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const [inviteCodes, setInviteCodes] = useState([]);
  const [identificacao, setIdentificacao] = useState('');
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || session.user.user_metadata?.tipo_conta !== 'admin') {
        // Se não for admin, redireciona para a página principal ou login
        navigate('/');
      } else {
        setAuthorized(true);
        await carregarCodigos();
      }
      setLoading(false);
    };

    checkAdminAuth();
  }, [navigate]);

  const carregarCodigos = async () => {
    try {
      // Integração direta com o QueryBuilder do seu repositório
      const { data, error } = await supabase.from('codigos_convite').select('*');
      if (!error && data) {
        setInviteCodes(data);
      } else {
        // Fallback de desenvolvimento caso a tabela ainda não esteja criada no banco
        setInviteCodes([
          { id: 1, codigo: 'SMART-DERM-2026', identificacao: 'Admin Geral', status: 'Ativo' }
        ]);
      }
    } catch (err) {
      console.error("Erro ao buscar códigos:", err);
    }
  };

  const handleGenerateCode = async (e) => {
    e.preventDefault();
    if (!identificacao.trim()) return;

    const novoCodigo = `SD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const novoRegistro = {
      codigo: novoCodigo,
      identificacao: identificacao,
      status: 'Ativo',
      criado_em: new Date().toISOString()
    };

    // Salva no banco de dados através do Supabase
    const { error } = await supabase.from('codigos_convite').insert([novoRegistro]);

    if (!error) {
      setInviteCodes([novoRegistro, ...inviteCodes]);
      setIdentificacao('');
    } else {
      // Fallback local para testes visuais imediato
      setInviteCodes([{ id: Date.now(), ...novoRegistro }, ...inviteCodes]);
      setIdentificacao('');
    }
  };

  const handleRevoke = async (id, codigo) => {
    // Remove ou atualiza o status no banco
    const { error } = await supabase.from('codigos_convite').delete().eq('id', id);
    
    if (!error) {
      setInviteCodes(inviteCodes.filter(item => item.id !== id && item.codigo !== codigo));
    }
  };

  if (loading) {
    return <div className="admin-loading">Carregando painel de segurança...</div>;
  }

  if (!authorized) return null;

  return (
    <div className="admin-container">
      {/* Sidebar de Navegação Integrada */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>Smart<span>Derm</span></h2>
          <small>Painel de Controle</small>
        </div>
        <nav className="admin-nav">
          <ul>
            <li className="nav-item active">
              <span className="icon">🔑</span> Gestão de Convites
            </li>
            <li className="nav-item" onClick={() => navigate('/dashboard')}>
              <span className="icon">📊</span> Voltar à Plataforma
            </li>
          </ul>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="admin-main-content">
        <header className="admin-main-header">
          <h1>Controle de Acesso</h1>
          <p>Gere e revogue chaves de acesso exclusivas para novos membros da plataforma.</p>
        </header>

        <div className="admin-grid">
          {/* Card de Criação */}
          <div className="admin-card">
            <h3>Criar Novo Convite</h3>
            <form onSubmit={handleGenerateCode} className="admin-form">
              <label htmlFor="identificacao">Destinatário / Descrição</label>
              <input 
                id="identificacao"
                type="text" 
                placeholder="Ex: Dr. Silva - Hospital Central" 
                value={identificacao}
                onChange={(e) => setIdentificacao(e.target.value)}
                required
              />
              <button type="submit" className="btn-admin-submit">
                Gerar Chave de Acesso
              </button>
            </form>
          </div>

          {/* Card da Tabela de Registros */}
          <div className="admin-card table-card">
            <h3>Chaves Ativas no Sistema</h3>
            <div className="table-responsive">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Identificação</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {inviteCodes.map((item, index) => (
                    <tr key={item.id || index}>
                      <td><span className="badge-code">{item.codigo}</span></td>
                      <td>{item.identificacao}</td>
                      <td><span className="badge-status-active">{item.status}</span></td>
                      <td>
                        <button 
                          className="btn-admin-revoke"
                          onClick={() => handleRevoke(item.id, item.codigo)}
                        >
                          Revogar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
