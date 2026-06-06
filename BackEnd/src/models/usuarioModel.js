// Modelo de usuário — sem ORM, objetos JS puros para o Supabase

/**
 * Valida e formata os dados para inserção de um novo usuário.
 * @param {Object} dados
 * @returns {Object}
 */
export function criarUsuario(dados) {
    const { id, nome, email, tipo_conta, identificador, created_at } = dados;

    if (!nome) throw new Error('Campo obrigatório ausente: nome');
    if (!email) throw new Error('Campo obrigatório ausente: email');
    if (!tipo_conta) throw new Error('Campo obrigatório ausente: tipo_conta');
    if (!identificador) throw new Error('Campo obrigatório ausente: identificador');

    const tiposValidos = ['paciente', 'medico', 'cientista'];
    if (!tiposValidos.includes(tipo_conta)) {
        throw new Error(`tipo_conta inválido: ${tipo_conta}. Use: ${tiposValidos.join(', ')}`);
    }

    return {
        id,
        nome,
        email,
        tipo_conta,
        identificador,
        created_at: created_at || new Date().toISOString(),
    };
}

/**
 * Remove campos sensíveis do objeto retornado pelo banco.
 * @param {Object} raw
 * @returns {Object}
 */
export function formatarUsuario(raw) {
    if (!raw) return null;
    const { id, nome, email, tipo_conta, identificador, created_at } = raw;
    return { id, nome, email, tipo_conta, identificador, created_at };
}
