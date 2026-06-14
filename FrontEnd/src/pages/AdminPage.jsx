import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const [inviteCodes, setInviteCodes] = useState([]);
  const [identificacao, setIdentificacao] = useState('');
  const [loading, setLoading] = useState(true);

  // O URL do seu backend Node
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    if (!token || !userRaw) {
      navigate('/'); // Sem login, manda pra home
      return;
    }

    const user = JSON.parse(userRaw);
    
    // Confirma se o usuário logado é cientista (Admin)
    if (user.tipo_conta !== 'cientista') {
      navigate('/');
    } else {
      carregarCodigos(token);
    }
    setLoading(false);
  }, [navigate]);

  const carregarCodigos = async (token) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/convites/admin/convites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInviteCodes(data);
      }
    } catch (err) {
      console.error("Erro ao buscar códigos da API:", err);
    }
  };

  const handleGenerateCode = async (e) => {
    e.preventDefault();
    if (!identificacao.trim()) return;

    const novoCodigo = `SD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${BACKEND_URL}/api/convites/admin/convites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          codigo: novoCodigo,
          identificacao: identificacao,
          status: 'Ativo'
        })
      });

      if (response.ok) {
        const novoRegistro = await response.json();
        setInviteCodes([novoRegistro, ...inviteCodes]);
        setIdentificacao('');
      }
    } catch (err) {
      console.error("Erro ao salvar convite:", err);
    }
  };

  const handleRevoke = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${BACKEND_URL}/api/convites/admin/convites/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setInviteCodes(inviteCodes.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Erro ao revogar:", err);
    }
  };

  if (loading) return <div className="admin-loading">Verificando segurança...</div>;

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>Smart<span>Derm</span></h2>
          <small>Painel de Controle</small>
        </div>
        <nav className="admin-nav">
          <ul>
            <li className="nav-item active"><span className="icon">🔑</span> Gestão de Convites</li>
            {/* Preparados para as novas páginas baseadas na sua pergunta */}
            <li className="nav-item" onClick={() => navigate('/admin/usuarios')}><span className="icon">👥</span> Usuários</li>
            <li className="nav-item" onClick={() => navigate('/admin/configuracoes')}><span className="icon">⚙️</span> Configurações</li>
            <li className="nav-item" onClick={() => navigate('/')}><span className="icon">🏠</span> Voltar à Plataforma</li>
          </ul>
        </nav>
      </aside>

      <main className="admin-main-content">
        <header className="admin-main-header">
          <h1>Controle de Acesso</h1>
          <p>Gere e revogue chaves de acesso para médicos e cientistas.</p>
        </header>

        <div className="admin-grid">
          <div className="admin-card">
            <h3>Criar Novo Convite</h3>
            <form onSubmit={handleGenerateCode} className="admin-form">
              <label htmlFor="identificacao">Destinatário / Descrição</label>
              <input 
                id="identificacao" type="text" placeholder="Ex: Dr. Silva - Hospital Central" 
                value={identificacao} onChange={(e) => setIdentificacao(e.target.value)} required
              />
              <button type="submit" className="btn-admin-submit">Gerar Chave de Acesso</button>
            </form>
          </div>

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
                  {inviteCodes.map((item) => (
                    <tr key={item.id}>
                      <td><span className="badge-code">{item.codigo}</span></td>
                      <td>{item.identificacao}</td>
                      <td><span className="badge-status-active">{item.status}</span></td>
                      <td>
                        <button className="btn-admin-revoke" onClick={() => handleRevoke(item.id)}>Revogar</button>
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
