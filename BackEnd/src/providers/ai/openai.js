import OpenAI from 'openai';
import { performance } from 'node:perf_hooks';
import { createMetrics } from '../../models/Metrics.js';
import { createAIResult } from '../../models/Laudo.js';
import { PROMPT_ANALISE_DERMATOLOGICA_V1, PROMPT_VERSAO } from './prompt.js';

const MODELO_PADRAO = 'gpt-4o';

// Preços por 1k tokens em USD — GPT-4o
const CUSTO_INPUT_POR_1K = 0.0025;
const CUSTO_OUTPUT_POR_1K = 0.01;

export async function analisarComOpenAI(imagemBuffer, mimeType = 'image/jpeg', config = {}) {
  const inicio = performance.now();

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const base64 = imagemBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const response = await client.chat.completions.create({
      model: config.modelo || MODELO_PADRAO,
      temperature: config.temperatura ?? 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: PROMPT_ANALISE_DERMATOLOGICA_V1 },
            { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
          ],
        },
      ],
    });

    const fim = performance.now();
    const tokensEntrada = response.usage?.prompt_tokens ?? null;
    const tokensSaida = response.usage?.completion_tokens ?? null;
    const custoEstimadoUSD =
      tokensEntrada != null && tokensSaida != null
        ? (tokensEntrada / 1000) * CUSTO_INPUT_POR_1K + (tokensSaida / 1000) * CUSTO_OUTPUT_POR_1K
        : null;

    const textoResposta = response.choices[0].message.content;
    const dadosParsed = JSON.parse(textoResposta);

    return createAIResult({
      provider: 'openai',
      modelo: config.modelo || MODELO_PADRAO,
      diagnostico: dadosParsed.diagnostico_preliminar,
      classificacao: dadosParsed.classificacao,
      rawResponse: textoResposta,
      metricas: createMetrics({
        latenciaMs: Math.round(fim - inicio),
        tokensEntrada,
        tokensSaida,
        custoEstimadoUSD,
        confiancaClassificacao: dadosParsed.classificacao?.confianca ?? null,
        qualidadeImagem: dadosParsed.qualidade_imagem?.score ?? null,
        versaoPrompt: PROMPT_VERSAO,
        promptUsado: PROMPT_ANALISE_DERMATOLOGICA_V1,
        temperaturaUsada: config.temperatura ?? 0.1,
        configuracoes: config,
      }),
    });
  } catch (erro) {
    const fim = performance.now();
    return createAIResult({
      provider: 'openai',
      modelo: config.modelo || MODELO_PADRAO,
      diagnostico: null,
      classificacao: null,
      erro: erro.message,
      metricas: createMetrics({
        latenciaMs: Math.round(fim - inicio),
        versaoPrompt: PROMPT_VERSAO,
        configuracoes: config,
      }),
    });
  }
}
