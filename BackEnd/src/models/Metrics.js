export function createMetrics({
  latenciaMs = null,
  tokensEntrada = null,
  tokensSaida = null,
  custoEstimadoUSD = null,
  qualidadeImagem = null,
  resolucao = null,
  formatoImagem = null,
  tamanhoArquivoKB = null,
  confiancaClassificacao = null,
  versaoPrompt = 'v1',
  promptUsado = null,
  temperaturaUsada = null,
  configuracoes = {},
  timestamp = new Date().toISOString(),
} = {}) {
  return {
    latenciaMs, tokensEntrada, tokensSaida, custoEstimadoUSD,
    qualidadeImagem, resolucao, formatoImagem, tamanhoArquivoKB,
    confiancaClassificacao, versaoPrompt, promptUsado,
    temperaturaUsada, configuracoes, timestamp,
  };
}
