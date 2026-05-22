export const LaudoStatus = {
  PENDENTE: 'pendente',
  PROCESSANDO: 'processando',
  CONCLUIDO: 'concluido',
  ERRO: 'erro',
};

export function createLaudo({
  id = null, usuarioId, imagemId, imagemUrl,
  resultadosAI = [],
  diagnosticoFinal = null,
  status = LaudoStatus.PENDENTE,
  criadoEm = new Date().toISOString(),
  atualizadoEm = new Date().toISOString(),
} = {}) {
  return { id, usuarioId, imagemId, imagemUrl, resultadosAI, diagnosticoFinal, status, criadoEm, atualizadoEm };
}

export function createAIResult({
  provider, modelo, diagnostico, classificacao, metricas,
  rawResponse = null, erro = null,
  criadoEm = new Date().toISOString(),
} = {}) {
  return { provider, modelo, diagnostico, classificacao, metricas, rawResponse, erro, criadoEm };
}
