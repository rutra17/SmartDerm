import Anthropic from '@anthropic-ai/sdk';
import { performance } from 'node:perf_hooks';
import { createMetrics } from '../../models/Metrics.js';
import { createAIResult } from '../../models/Laudo.js';
import { PROMPT_ANALISE_DERMATOLOGICA_V1, PROMPT_VERSAO } from './prompt.js';

const MODELO_PADRAO       = 'claude-sonnet-4-6';
const CUSTO_INPUT_POR_1K  = 0.003;
const CUSTO_OUTPUT_POR_1K = 0.015;

export async function analisarComClaude(imagemBuffer, mimeType = 'image/jpeg', config = {}) {
  const inicio = performance.now();
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const base64 = imagemBuffer.toString('base64');

    const response = await client.messages.create({
      model: config.modelo || MODELO_PADRAO,
      max_tokens: config.maxTokens ?? 1024,
      temperature: config.temperatura ?? 0.1,
      messages: [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
        { type: 'text', text: PROMPT_ANALISE_DERMATOLOGICA_V1 },
      ]}],
    });
    const fim = performance.now();

    const tokensEntrada    = response.usage?.input_tokens ?? null;
    const tokensSaida      = response.usage?.output_tokens ?? null;
    const custoEstimadoUSD = tokensEntrada != null && tokensSaida != null
      ? (tokensEntrada / 1000) * CUSTO_INPUT_POR_1K + (tokensSaida / 1000) * CUSTO_OUTPUT_POR_1K : null;

    const textoResposta = response.content[0].text;
    const dadosParsed   = JSON.parse(textoResposta);

    return createAIResult({
      provider: 'claude', modelo: config.modelo || MODELO_PADRAO,
      diagnostico: dadosParsed.diagnostico_preliminar, classificacao: dadosParsed.classificacao,
      rawResponse: textoResposta,
      metricas: createMetrics({ latenciaMs: Math.round(fim - inicio), tokensEntrada, tokensSaida,
        custoEstimadoUSD, confiancaClassificacao: dadosParsed.classificacao?.confianca ?? null,
        qualidadeImagem: dadosParsed.qualidade_imagem?.score ?? null,
        versaoPrompt: PROMPT_VERSAO, promptUsado: PROMPT_ANALISE_DERMATOLOGICA_V1,
        temperaturaUsada: config.temperatura ?? 0.1, configuracoes: config }),
    });
  } catch (erro) {
    const fim = performance.now();
    return createAIResult({ provider: 'claude', modelo: config.modelo || MODELO_PADRAO,
      diagnostico: null, classificacao: null, erro: erro.message,
      metricas: createMetrics({ latenciaMs: Math.round(fim - inicio), versaoPrompt: PROMPT_VERSAO, configuracoes: config }) });
  }
}
