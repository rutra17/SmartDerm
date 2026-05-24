import { randomUUID } from 'node:crypto';
import { uploadImagem } from '../providers/storage/index.js';
import {
  analisarComClaude,
  analisarComOpenAI,
  analisarComGemini,
  analisarComDeepSeek,
  PROVIDERS_DISPONIVEIS,
} from '../providers/ai/index.js';
import { createLaudo, LaudoStatus } from '../models/Laudo.js';

const PROVIDERS = {
  claude:   analisarComClaude,
  openai:   analisarComOpenAI,
  gemini:   analisarComGemini,
  deepseek: analisarComDeepSeek,
};

export const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhuma imagem foi enviada.' });
  }

  const { buffer, mimetype, originalname } = req.file;

  // Provider escolhido via query (?provider=gemini) ou variável de ambiente, padrão: gemini
  const providerSolicitado = (req.query.provider || process.env.AI_PROVIDER || 'gemini').toLowerCase();

  if (!PROVIDERS_DISPONIVEIS.includes(providerSolicitado)) {
    return res.status(400).json({
      error: `Provider inválido: "${providerSolicitado}". Disponíveis: ${PROVIDERS_DISPONIVEIS.join(', ')}`,
    });
  }

  // Upload da imagem para o MinIO
  const nomeArquivo = `${randomUUID()}-${originalname}`;
  const { url: imagemUrl, caminho, erro: erroStorage } = await uploadImagem(buffer, nomeArquivo, mimetype);

  if (erroStorage) {
    return res.status(500).json({ error: `Falha no storage: ${erroStorage}` });
  }

  // Análise com o provider de IA selecionado
  const analisar = PROVIDERS[providerSolicitado];
  const resultadoAI = await analisar(buffer, mimetype);

  const laudo = createLaudo({
    id:           randomUUID(),
    imagemId:     caminho,
    imagemUrl,
    resultadosAI: [resultadoAI],
    status:       resultadoAI.erro ? LaudoStatus.ERRO : LaudoStatus.CONCLUIDO,
  });

  const statusHttp = resultadoAI.erro ? 500 : 200;
  return res.status(statusHttp).json(laudo);
};
