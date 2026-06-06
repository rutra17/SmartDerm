// Modelo de laudo — sem ORM, objetos JS puros para o Supabase

/**
 * Valida e formata os dados para inserção de um novo laudo.
 * @param {Object} dados
 * @returns {Object}
 */
export function criarLaudo(dados) {
    const { id, consulta_id, paciente_id, medico_id, texto_ia, ia_utilizada, prompt_utilizado, imagem_url, created_at } = dados;

    if (!consulta_id) throw new Error('Campo obrigatório ausente: consulta_id');
    if (!texto_ia) throw new Error('Campo obrigatório ausente: texto_ia');
    if (!ia_utilizada) throw new Error('Campo obrigatório ausente: ia_utilizada');

    return {
        id,
        consulta_id,
        paciente_id: paciente_id || null,
        medico_id: medico_id || null,
        texto_ia,
        ia_utilizada,
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
export function formatarLaudo(raw) {
    if (!raw) return null;
    const { id, consulta_id, paciente_id, medico_id, texto_ia, ia_utilizada, prompt_utilizado, imagem_url, created_at } = raw;
    return { id, consulta_id, paciente_id, medico_id, texto_ia, ia_utilizada, prompt_utilizado, imagem_url, created_at };
}
