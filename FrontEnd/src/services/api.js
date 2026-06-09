const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('smartderm_token');

function authHeaders(isFormData = false) {
    const h = {};
    if (!isFormData) h['Content-Type'] = 'application/json';
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const apiLogin = async (identificador, tipo_conta, senha) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ identificador, tipo_conta, senha }),
    });
    return res.json();
};

export const apiRegister = async (dados) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(dados),
    });
    return res.json();
};

// ─── Consultas ───────────────────────────────────────────────────────────────

export const getConsultas = async () => {
    const res = await fetch(`${BASE_URL}/consultas`, { headers: authHeaders() });
    return res.json();
};

export const criarConsulta = async () => {
    const res = await fetch(`${BASE_URL}/consultas`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({}),
    });
    return res.json();
};

export const atualizarConsulta = async (id, dados) => {
    const res = await fetch(`${BASE_URL}/consultas/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(dados),
    });
    return res.json();
};

// ─── Mensagens ───────────────────────────────────────────────────────────────

export const getMensagens = async (consulta_id) => {
    const res = await fetch(`${BASE_URL}/mensagens?consulta_id=${consulta_id}`, {
        headers: authHeaders(),
    });
    return res.json();
};

export const criarMensagem = async (dados) => {
    const res = await fetch(`${BASE_URL}/mensagens`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(dados),
    });
    return res.json();
};

// ─── Prompts ─────────────────────────────────────────────────────────────────

export const getPrompts = async () => {
    const res = await fetch(`${BASE_URL}/prompts`, { headers: authHeaders() });
    return res.json();
};

export const criarPrompt = async (dados) => {
    const res = await fetch(`${BASE_URL}/prompts`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(dados),
    });
    return res.json();
};

export const atualizarPrompt = async (id, dados) => {
    const res = await fetch(`${BASE_URL}/prompts/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(dados),
    });
    return res.json();
};

export const excluirPromptAPI = async (id) => {
    const res = await fetch(`${BASE_URL}/prompts/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return res.json();
};

// ─── Estatísticas ─────────────────────────────────────────────────────────────

export const getStats = async () => {
    const res = await fetch(`${BASE_URL}/stats`, { headers: authHeaders() });
    return res.json();
};

// ─── Upload de imagem + análise IA ───────────────────────────────────────────

export const uploadImageToBackend = async (imageFile, userText, selectedAI, selectedPrompt, consultaId) => {
    const formData = new FormData();
    formData.append('imagem', imageFile);
    formData.append('userText', userText || '');
    formData.append('aiModel', selectedAI);
    formData.append('promptKey', selectedPrompt);
    formData.append('consultaId', consultaId);

    const res = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        headers: authHeaders(true),
        body: formData,
    });
    return res.json();
};
