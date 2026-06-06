// Modelo de mensagem — sem ORM, objetos JS puros para o Supabase

/**
 * Valida e formata os dados para inserção de uma nova mensagem.
 * @param {Object} dados
 * @returns {Object}
 */
export function criarMensagem(dados) {
    const { id, consulta_id, role, texto, ia_utilizada, prompt_utilizado, imagem_url, created_at } = dados;

    if (!consulta_id) throw new Error('Campo obrigatório ausente: consulta_id');
    if (!texto) throw new Error('Campo obrigatório ausente: texto');

    const rolesValidos = ['user', 'assistant'];
    const roleFinal = role || 'assistant';
    if (!rolesValidos.includes(roleFinal)) {
        throw new Error(`role inválido: ${roleFinal}. Use: ${rolesValidos.join(', ')}`);
    }

    return {
        id,
        consulta_id,
        role: roleFinal,
        texto,
        ia_utilizada: ia_utilizada || null,
        prompt_utilizado: prompt_utilizado || null,
        imagem_url: imagem_url || null,
        created_at: created_at || new Date().toISOString(),
    };
}

/**
 * Retorna um objeto limpo vindo do banco.
 * @param {Object} raw
 * @returns {Object}
 */
export function formatarMensagem(raw) {
    if (!raw) return null;
    const { id, consulta_id, role, texto, ia_utilizada, prompt_utilizado, imagem_url, created_at } = raw;
    return { id, consulta_id, role, texto, ia_utilizada, prompt_utilizado, imagem_url, created_at };
}
