const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'smartderm_token';
const USER_KEY = 'smartderm_user';

const getHeaders = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    return h;
};

const tableToEndpoint = (table) => {
    const map = { consultas: 'consultas', mensagens: 'mensagens', engenharia_prompts: 'prompts' };
    return map[table] || table;
};

const parseEmail = (email) => {
    const [local, domain] = email.split('@');
    if (domain.startsWith('paciente')) return { identificador: local, tipo_conta: 'paciente' };
    if (domain.startsWith('medico')) return { identificador: local, tipo_conta: 'medico' };
    if (domain.startsWith('cientista')) return { identificador: local, tipo_conta: 'cientista' };
    return { identificador: local, tipo_conta: 'paciente' };
};

class QueryBuilder {
    constructor(table) {
        this._table = table;
        this._operation = 'select';
        this._filters = {};
        this._updateData = null;
    }

    select() { return this; }

    update(data) {
        this._operation = 'update';
        this._updateData = data;
        return this;
    }

    eq(column, value) {
        this._filters[column] = value;
        return this;
    }

    order() { return this; }

    then(resolve, reject) {
        return this._execute().then(resolve, reject);
    }

    catch(reject) {
        return this._execute().catch(reject);
    }

    async _execute() {
        const endpoint = tableToEndpoint(this._table);
        try {
            if (this._operation === 'update') {
                const id = this._filters['id'];
                const res = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
                    method: 'PUT',
                    headers: getHeaders(),
                    body: JSON.stringify(this._updateData),
                });
                const json = await res.json();
                return res.ok ? { data: json, error: null } : { data: null, error: json };
            }

            const params = new URLSearchParams(this._filters).toString();
            const url = params ? `${BASE_URL}/${endpoint}?${params}` : `${BASE_URL}/${endpoint}`;
            const res = await fetch(url, { headers: getHeaders() });
            const json = await res.json();
            if (!res.ok) return { data: null, error: json };
            return { data: Array.isArray(json) ? json : (json.data ?? json), error: null };
        } catch (error) {
            return { data: null, error };
        }
    }
}

const auth = {
    async signInWithPassword({ email, password }) {
        const { identificador, tipo_conta } = parseEmail(email);
        try {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identificador, tipo_conta, senha: password }),
            });
            const json = await res.json();
            if (!res.ok) return { data: null, error: { message: json.error || 'Erro no login.' } };

            localStorage.setItem(TOKEN_KEY, json.token);
            localStorage.setItem(USER_KEY, JSON.stringify(json.user));
            return { data: { user: json.user, session: json.token }, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    async getSession() {
        const token = localStorage.getItem(TOKEN_KEY);
        const userRaw = localStorage.getItem(USER_KEY);
        if (!token || !userRaw) return { data: { session: null }, error: null };
        try {
            const user = JSON.parse(userRaw);
            return {
                data: {
                    session: {
                        access_token: token,
                        user: { id: user.id, user_metadata: { tipo_conta: user.tipo_conta, nome: user.nome } },
                    },
                },
                error: null,
            };
        } catch {
            return { data: { session: null }, error: null };
        }
    },

    async signOut() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return { error: null };
    },
};

export const supabase = {
    auth,
    from: (table) => new QueryBuilder(table),
};
