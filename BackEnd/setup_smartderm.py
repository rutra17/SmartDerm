import os

def escrever(caminho, conteudo):
    os.makedirs(os.path.dirname(caminho), exist_ok=True)
    with open(caminho, 'w') as f:
        f.write(conteudo)
    print(f'✅ {caminho}')

# ── models/User.js ─────────────────────────────────────────────────────────────
escrever('src/models/User.js', """export const UserRoles = {
  ADMIN: 'admin',
  MEDICO: 'medico',
  PACIENTE: 'paciente',
};

export function createUser({
  id = null, nome, email,
  role = UserRoles.PACIENTE,
  criadoEm = new Date().toISOString(),
} = {}) {
  return { id, nome, email, role, criadoEm };
}

export const UserSchema = {
  id: 'uuid | string',
  nome: 'string',
  email: 'string',
  role: 'admin | medico | paciente',
  criadoEm: 'ISO 8601 timestamp',
};
""")

# ── models/Laudo.js ────────────────────────────────────────────────────────────
escrever('src/models/Laudo.js', """export const LaudoStatus = {
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
""")

# ── models/Historico.js ────────────────────────────────────────────────────────
escrever('src/models/Historico.js', """export const HistoricoAcao = {
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
""")

# ── models/Metrics.js ──────────────────────────────────────────────────────────
escrever('src/models/Metrics.js', """export function createMetrics({
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
""")

# ── models/index.js ────────────────────────────────────────────────────────────
escrever('src/models/index.js', """export { createUser, UserRoles, UserSchema } from './User.js';
export { createLaudo, createAIResult, LaudoStatus } from './Laudo.js';
export { createHistorico, HistoricoAcao } from './Historico.js';
export { createMetrics } from './Metrics.js';
""")

# ── providers/ai/prompt.js ─────────────────────────────────────────────────────
escrever('src/providers/ai/prompt.js', """export const PROMPT_VERSAO = 'v1';

export const PROMPT_ANALISE_DERMATOLOGICA_V1 = `Voce e um sistema especializado em analise de imagens dermatologicas de suporte diagnostico.

Analise a imagem de lesao de pele fornecida e retorne um JSON com a seguinte estrutura EXATA:

{
  "classificacao": {
    "tipo": "<melanoma | nevo_benigno | carcinoma_basocelular | carcinoma_espinocelular | queratose_seborreica | outros>",
    "confianca": <numero de 0.0 a 1.0>
  },
  "diagnostico_preliminar": "<descricao tecnica da lesao em linguagem medica, maximo 3 frases>",
  "caracteristicas_observadas": {
    "bordas": "<regulares | irregulares | mal_definidas>",
    "coloracao": "<homogenea | heterogenea>",
    "assimetria": "<simetrica | assimetrica>",
    "diametro_estimado": "<pequeno (<6mm) | medio (6-20mm) | grande (>20mm) | nao_avaliavel>"
  },
  "nivel_urgencia": "<baixo | moderado | alto>",
  "recomendacao": "<orientacao de encaminhamento em 1 frase>",
  "qualidade_imagem": {
    "score": <numero de 0.0 a 1.0>,
    "observacao": "<principais problemas de foco, iluminacao, angulo ou resolucao, se houver>"
  },
  "aviso": "Este resultado e apenas um suporte diagnostico preliminar. A avaliacao medica presencial e indispensavel."
}

Responda APENAS com o JSON, sem texto adicional.\`;
""")

# ── providers/ai/gemini.js ─────────────────────────────────────────────────────
escrever('src/providers/ai/gemini.js', """import { GoogleGenerativeAI } from '@google/generative-ai';
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
""")

# ── providers/ai/openai.js ─────────────────────────────────────────────────────
escrever('src/providers/ai/openai.js', """import OpenAI from 'openai';
import { performance } from 'node:perf_hooks';
import { createMetrics } from '../../models/Metrics.js';
import { createAIResult } from '../../models/Laudo.js';
import { PROMPT_ANALISE_DERMATOLOGICA_V1, PROMPT_VERSAO } from './prompt.js';

const MODELO_PADRAO       = 'gpt-4o';
const CUSTO_INPUT_POR_1K  = 0.0025;
const CUSTO_OUTPUT_POR_1K = 0.01;

export async function analisarComOpenAI(imagemBuffer, mimeType = 'image/jpeg', config = {}) {
  const inicio = performance.now();
  try {
    const client  = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const base64  = imagemBuffer.toString('base64');
    const dataUrl = \`data:\${mimeType};base64,\${base64}\`;

    const response = await client.chat.completions.create({
      model: config.modelo || MODELO_PADRAO, temperature: config.temperatura ?? 0.1,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: [
        { type: 'text', text: PROMPT_ANALISE_DERMATOLOGICA_V1 },
        { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
      ]}],
    });
    const fim = performance.now();

    const tokensEntrada    = response.usage?.prompt_tokens ?? null;
    const tokensSaida      = response.usage?.completion_tokens ?? null;
    const custoEstimadoUSD = tokensEntrada != null && tokensSaida != null
      ? (tokensEntrada / 1000) * CUSTO_INPUT_POR_1K + (tokensSaida / 1000) * CUSTO_OUTPUT_POR_1K : null;

    const textoResposta = response.choices[0].message.content;
    const dadosParsed   = JSON.parse(textoResposta);

    return createAIResult({
      provider: 'openai', modelo: config.modelo || MODELO_PADRAO,
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
    return createAIResult({ provider: 'openai', modelo: config.modelo || MODELO_PADRAO,
      diagnostico: null, classificacao: null, erro: erro.message,
      metricas: createMetrics({ latenciaMs: Math.round(fim - inicio), versaoPrompt: PROMPT_VERSAO, configuracoes: config }) });
  }
}
""")

# ── providers/ai/claude.js ─────────────────────────────────────────────────────
escrever('src/providers/ai/claude.js', """import Anthropic from '@anthropic-ai/sdk';
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
""")

# ── providers/ai/deepseek.js ───────────────────────────────────────────────────
escrever('src/providers/ai/deepseek.js', """import OpenAI from 'openai';
import { performance } from 'node:perf_hooks';
import { createMetrics } from '../../models/Metrics.js';
import { createAIResult } from '../../models/Laudo.js';
import { PROMPT_ANALISE_DERMATOLOGICA_V1, PROMPT_VERSAO } from './prompt.js';

const MODELO_PADRAO       = 'deepseek-chat';
const BASE_URL            = 'https://api.deepseek.com';
const CUSTO_INPUT_POR_1K  = 0.00027;
const CUSTO_OUTPUT_POR_1K = 0.0011;

export async function analisarComDeepSeek(imagemBuffer, mimeType = 'image/jpeg', config = {}) {
  const inicio = performance.now();
  try {
    const client  = new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: BASE_URL });
    const base64  = imagemBuffer.toString('base64');
    const dataUrl = \`data:\${mimeType};base64,\${base64}\`;

    const response = await client.chat.completions.create({
      model: config.modelo || MODELO_PADRAO, temperature: config.temperatura ?? 0.1,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: [
        { type: 'text', text: PROMPT_ANALISE_DERMATOLOGICA_V1 },
        { type: 'image_url', image_url: { url: dataUrl } },
      ]}],
    });
    const fim = performance.now();

    const tokensEntrada    = response.usage?.prompt_tokens ?? null;
    const tokensSaida      = response.usage?.completion_tokens ?? null;
    const custoEstimadoUSD = tokensEntrada != null && tokensSaida != null
      ? (tokensEntrada / 1000) * CUSTO_INPUT_POR_1K + (tokensSaida / 1000) * CUSTO_OUTPUT_POR_1K : null;

    const textoResposta = response.choices[0].message.content;
    const dadosParsed   = JSON.parse(textoResposta);

    return createAIResult({
      provider: 'deepseek', modelo: config.modelo || MODELO_PADRAO,
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
    return createAIResult({ provider: 'deepseek', modelo: config.modelo || MODELO_PADRAO,
      diagnostico: null, classificacao: null, erro: erro.message,
      metricas: createMetrics({ latenciaMs: Math.round(fim - inicio), versaoPrompt: PROMPT_VERSAO, configuracoes: config }) });
  }
}
""")

# ── providers/ai/index.js ──────────────────────────────────────────────────────
escrever('src/providers/ai/index.js', """export { analisarComGemini }   from './gemini.js';
export { analisarComOpenAI }   from './openai.js';
export { analisarComClaude }   from './claude.js';
export { analisarComDeepSeek } from './deepseek.js';
export { PROMPT_ANALISE_DERMATOLOGICA_V1, PROMPT_VERSAO } from './prompt.js';

export const PROVIDERS_DISPONIVEIS = ['gemini', 'openai', 'claude', 'deepseek'];
""")

# ── providers/storage/supabase.js ─────────────────────────────────────────────
escrever('src/providers/storage/supabase.js', """import { createClient } from '@supabase/supabase-js';

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'smartderm-imagens';

function getClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function uploadImagemSupabase(buffer, nomeArquivo, mimeType = 'image/jpeg') {
  const supabase = getClient();
  const caminho  = \`lesoes/\${nomeArquivo}\`;
  const { error } = await supabase.storage.from(BUCKET).upload(caminho, buffer, { contentType: mimeType, upsert: false });
  if (error) return { url: null, caminho: null, erro: error.message };
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(caminho);
  return { url: urlData.publicUrl, caminho, erro: null };
}

export async function removerImagemSupabase(caminho) {
  const supabase = getClient();
  const { error } = await supabase.storage.from(BUCKET).remove([caminho]);
  return { sucesso: !error, erro: error?.message ?? null };
}
""")

# ── providers/storage/firebase.js ─────────────────────────────────────────────
escrever('src/providers/storage/firebase.js', """import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

const BUCKET = process.env.FIREBASE_STORAGE_BUCKET;

function getFirebaseApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, '\\n'),
    }),
    storageBucket: BUCKET,
  });
}

export async function uploadImagemFirebase(buffer, nomeArquivo, mimeType = 'image/jpeg') {
  try {
    getFirebaseApp();
    const caminho = \`lesoes/\${nomeArquivo}\`;
    const fileRef = getStorage().bucket().file(caminho);
    await fileRef.save(buffer, { metadata: { contentType: mimeType } });
    await fileRef.makePublic();
    return { url: \`https://storage.googleapis.com/\${BUCKET}/\${caminho}\`, caminho, erro: null };
  } catch (err) {
    return { url: null, caminho: null, erro: err.message };
  }
}

export async function removerImagemFirebase(caminho) {
  try {
    getFirebaseApp();
    await getStorage().bucket().file(caminho).delete();
    return { sucesso: true, erro: null };
  } catch (err) {
    return { sucesso: false, erro: err.message };
  }
}
""")

# ── providers/storage/index.js ────────────────────────────────────────────────
escrever('src/providers/storage/index.js', """import { uploadImagemSupabase, removerImagemSupabase } from './supabase.js';
import { uploadImagemFirebase, removerImagemFirebase } from './firebase.js';

const PROVIDER = process.env.STORAGE_PROVIDER || 'supabase';

export async function uploadImagem(buffer, nomeArquivo, mimeType = 'image/jpeg') {
  if (PROVIDER === 'firebase') return uploadImagemFirebase(buffer, nomeArquivo, mimeType);
  return uploadImagemSupabase(buffer, nomeArquivo, mimeType);
}

export async function removerImagem(caminho) {
  if (PROVIDER === 'firebase') return removerImagemFirebase(caminho);
  return removerImagemSupabase(caminho);
}

export { uploadImagemSupabase, removerImagemSupabase } from './supabase.js';
export { uploadImagemFirebase, removerImagemFirebase } from './firebase.js';
""")

# ── tests/testarModels.js ─────────────────────────────────────────────────────
escrever('src/tests/testarModels.js', """import { createUser, UserRoles }             from '../models/User.js';
import { createLaudo, createAIResult, LaudoStatus } from '../models/Laudo.js';
import { createHistorico, HistoricoAcao }   from '../models/Historico.js';
import { createMetrics }                    from '../models/Metrics.js';

console.log('\\n🧪 SmartDerm — Teste dos Models (sem API, sem banco)\\n');
console.log('═══════════════════════════════════════════════════\\n');

const usuario = createUser({ id: 'user-001', nome: 'Maria Julia', email: 'maria@smartderm.com', role: UserRoles.MEDICO });
console.log('✅ User criado:');
console.log(JSON.stringify(usuario, null, 2));

const metricas = createMetrics({ latenciaMs: 1832, tokensEntrada: 620, tokensSaida: 180,
  custoEstimadoUSD: 0.000423, confiancaClassificacao: 0.87, qualidadeImagem: 0.91,
  versaoPrompt: 'v1', temperaturaUsada: 0.1, formatoImagem: 'jpeg', tamanhoArquivoKB: 245 });
console.log('\\n✅ Metrics criado:');
console.log(JSON.stringify(metricas, null, 2));

const resultadoGemini = createAIResult({ provider: 'gemini', modelo: 'gemini-1.5-flash',
  diagnostico: 'Lesao pigmentada com bordas irregulares e coloracao heterogenea.',
  classificacao: { tipo: 'melanoma', confianca: 0.87 }, metricas });
console.log('\\n✅ AIResult criado:');
console.log(JSON.stringify(resultadoGemini, null, 2));

const laudo = createLaudo({ id: 'laudo-001', usuarioId: usuario.id, imagemId: 'img-abc123',
  imagemUrl: 'https://bucket.supabase.co/lesoes/img-abc123.jpg',
  resultadosAI: [resultadoGemini], status: LaudoStatus.CONCLUIDO });
console.log('\\n✅ Laudo criado:');
console.log(JSON.stringify(laudo, null, 2));

const evento = createHistorico({ usuarioId: usuario.id, laudoId: laudo.id,
  acao: HistoricoAcao.ANALISE_CONCLUIDA, metadados: { providers: ['gemini'], totalMs: 1832 } });
console.log('\\n✅ Historico criado:');
console.log(JSON.stringify(evento, null, 2));

console.log('\\n═══════════════════════════════════════════════════');
console.log('✅ Todos os models funcionando corretamente!\\n');
""")

# ── package.json ───────────────────────────────────────────────────────────────
escrever('package.json', """{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "@google/generative-ai": "^0.21.0",
    "@supabase/supabase-js": "^2.49.0",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "firebase-admin": "^13.0.0",
    "multer": "^2.1.1",
    "openai": "^4.100.0"
  }
}
""")

# ── .env ───────────────────────────────────────────────────────────────────────
if not os.path.exists('.env'):
    escrever('.env', """PORT=3000
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
DEEPSEEK_API_KEY=
STORAGE_PROVIDER=supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=smartderm-imagens
""")
    print('✅ .env criado')
else:
    print('⏭️  .env ja existe — mantido sem alteracao')

print('\n🚀 Setup concluido! Agora rode:')
print('   1. npm install')
print('   2. node src/tests/testarModels.js\n')
