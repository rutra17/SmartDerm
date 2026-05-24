export const LaudoStatus = {
  PENDENTE: 'pendente',
  PROCESSANDO: 'processando',
  CONCLUIDO: 'concluido',
  ERRO: 'erro',
};

export function createLaudo({
  id = null,
  usuarioId,
  imagemId,
  imagemUrl,
  resultadosAI = [],       // Array de createAIResult — um por provider
  diagnosticoFinal = null,
  status = LaudoStatus.PENDENTE,
  criadoEm = new Date().toISOString(),
  atualizadoEm = new Date().toISOString(),
} = {}) {
  return {
    id,
    usuarioId,
    imagemId,
    imagemUrl,
    resultadosAI,
    diagnosticoFinal,
    status,
    criadoEm,
    atualizadoEm,
  };
}

// Um resultado por provider de IA dentro do laudo
export function createAIResult({
  provider,             // 'gemini' | 'openai' | 'claude' | 'deepseek'
  modelo,
  diagnostico,
  classificacao,        // { tipo, confianca }
  metricas,             // objeto de createMetrics
  rawResponse = null,
  erro = null,
  criadoEm = new Date().toISOString(),
} = {}) {
  return { provider, modelo, diagnostico, classificacao, metricas, rawResponse, erro, criadoEm };
}
