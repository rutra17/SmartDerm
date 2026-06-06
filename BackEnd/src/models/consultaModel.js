// Modelo de consulta — sem ORM, objetos JS puros para o Supabase

/**
 * Valida e formata os dados para inserção de uma nova consulta.
 * @param {Object} dados
 * @returns {Object}
 */
export function criarConsulta(dados) {
    const { id, paciente_id, medico_id, status, titulo, created_at, updated_at } = dados;

    if (!paciente_id) throw new Error('Campo obrigatório ausente: paciente_id');
    if (!titulo) throw new Error('Campo obrigatório ausente: titulo');

    const statusValidos = ['aberta', 'em_analise', 'concluida'];
    const statusFinal = status || 'aberta';
    if (!statusValidos.includes(statusFinal)) {
        throw new Error(`status inválido: ${statusFinal}. Use: ${statusValidos.join(', ')}`);
    }

    const agora = new Date().toISOString();
    return {
        id,
        paciente_id,
        medico_id: medico_id || null,
        status: statusFinal,
        titulo,
        created_at: created_at || agora,
        updated_at: updated_at || agora,
    };
}

/**
 * Retorna um objeto limpo vindo do banco.
 * @param {Object} raw
 * @returns {Object}
 */
export function formatarConsulta(raw) {
    if (!raw) return null;
    const { id, paciente_id, medico_id, status, titulo, created_at, updated_at } = raw;
    return { id, paciente_id, medico_id, status, titulo, created_at, updated_at };
}
