import { GoogleGenerativeAI } from '@google/generative-ai';
import { performance } from 'node:perf_hooks';
import { createMetrics } from '../../models/Metrics.js';
import { createAIResult } from '../../models/Laudo.js';
import { PROMPT_ANALISE_DERMATOLOGICA_V1, PROMPT_VERSAO } from './prompt.js';

const MODELO_PADRAO = 'gemini-1.5-flash';
const CUSTO_INPUT_POR_1K  = 0.000075;
const CUSTO_OUTPUT_POR_1K = 0.0003;

export async function analisarComGemini(imagemBuffer, mimeType = 'image/jpeg', config = {}) {
  const inicio = performance.now();
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: config.modelo || MODELO_PADRAO,
      generationConfig: { temperature: config.temperatura ?? 0.1, responseMimeType: 'application/json' },
    });
    const imagePart = { inlineData: { data: imagemBuffer.toString('base64'), mimeType } };
    const result   = await model.generateContent([PROMPT_ANALISE_DERMATOLOGICA_V1, imagePart]);
    const response = result.response;
    const fim      = performance.now();

    const tokensEntrada    = response.usageMetadata?.promptTokenCount ?? null;
    const tokensSaida      = response.usageMetadata?.candidatesTokenCount ?? null;
    const custoEstimadoUSD = tokensEntrada != null && tokensSaida != null
      ? (tokensEntrada / 1000) * CUSTO_INPUT_POR_1K + (tokensSaida / 1000) * CUSTO_OUTPUT_POR_1K : null;

    const textoResposta = response.text();
    const dadosParsed   = JSON.parse(textoResposta);

    return createAIResult({
      provider: 'gemini', modelo: config.modelo || MODELO_PADRAO,
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
    return createAIResult({ provider: 'gemini', modelo: config.modelo || MODELO_PADRAO,
      diagnostico: null, classificacao: null, erro: erro.message,
      metricas: createMetrics({ latenciaMs: Math.round(fim - inicio), versaoPrompt: PROMPT_VERSAO, configuracoes: config }) });
  }
}
