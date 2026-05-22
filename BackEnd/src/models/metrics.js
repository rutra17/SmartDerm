// Salva TODAS as métricas de cada chamada de IA para comparação posterior
export function createMetrics({
  // Velocidade
  latenciaMs = null,

  // Custo
  tokensEntrada = null,
  tokensSaida = null,
  custoEstimadoUSD = null,

  // Qualidade da imagem (avaliada pelo próprio modelo no JSON de resposta)
  qualidadeImagem = null,      // 0.0 – 1.0
  resolucao = null,            // { largura, altura }
  formatoImagem = null,        // 'jpeg' | 'png' | 'webp' ...
  tamanhoArquivoKB = null,

  // Precisão
  confiancaClassificacao = null,  // 0.0 – 1.0

  // Prompt & configurações
  versaoPrompt = 'v1',
  promptUsado = null,
  temperaturaUsada = null,
  configuracoes = {},

  timestamp = new Date().toISOString(),
} = {}) {
  return {
    latenciaMs,
    tokensEntrada,
    tokensSaida,
    custoEstimadoUSD,
    qualidadeImagem,
    resolucao,
    formatoImagem,
    tamanhoArquivoKB,
    confiancaClassificacao,
    versaoPrompt,
    promptUsado,
    temperaturaUsada,
    configuracoes,
    timestamp,
  };
}
