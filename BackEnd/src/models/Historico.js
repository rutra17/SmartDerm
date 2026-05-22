export const HistoricoAcao = {
  UPLOAD_IMAGEM: 'upload_imagem',
  ANALISE_INICIADA: 'analise_iniciada',
  ANALISE_CONCLUIDA: 'analise_concluida',
  LAUDO_GERADO: 'laudo_gerado',
  LAUDO_REVISADO: 'laudo_revisado',
  ERRO: 'erro',
};

export function createHistorico({
  id = null, usuarioId, laudoId = null, acao,
  metadados = {},
  timestamp = new Date().toISOString(),
} = {}) {
  return { id, usuarioId, laudoId, acao, metadados, timestamp };
}
