import { createUser, UserRoles }             from '../models/User.js';
import { createLaudo, createAIResult, LaudoStatus } from '../models/Laudo.js';
import { createHistorico, HistoricoAcao }   from '../models/Historico.js';
import { createMetrics }                    from '../models/Metrics.js';

console.log('\n🧪 SmartDerm — Teste dos Models (sem API, sem banco)\n');
console.log('═══════════════════════════════════════════════════\n');

const usuario = createUser({ id: 'user-001', nome: 'Maria Julia', email: 'maria@smartderm.com', role: UserRoles.MEDICO });
console.log('✅ User criado:');
console.log(JSON.stringify(usuario, null, 2));

const metricas = createMetrics({ latenciaMs: 1832, tokensEntrada: 620, tokensSaida: 180,
  custoEstimadoUSD: 0.000423, confiancaClassificacao: 0.87, qualidadeImagem: 0.91,
  versaoPrompt: 'v1', temperaturaUsada: 0.1, formatoImagem: 'jpeg', tamanhoArquivoKB: 245 });
console.log('\n✅ Metrics criado:');
console.log(JSON.stringify(metricas, null, 2));

const resultadoGemini = createAIResult({ provider: 'gemini', modelo: 'gemini-1.5-flash',
  diagnostico: 'Lesao pigmentada com bordas irregulares e coloracao heterogenea.',
  classificacao: { tipo: 'melanoma', confianca: 0.87 }, metricas });
console.log('\n✅ AIResult criado:');
console.log(JSON.stringify(resultadoGemini, null, 2));

const laudo = createLaudo({ id: 'laudo-001', usuarioId: usuario.id, imagemId: 'img-abc123',
  imagemUrl: 'https://bucket.supabase.co/lesoes/img-abc123.jpg',
  resultadosAI: [resultadoGemini], status: LaudoStatus.CONCLUIDO });
console.log('\n✅ Laudo criado:');
console.log(JSON.stringify(laudo, null, 2));

const evento = createHistorico({ usuarioId: usuario.id, laudoId: laudo.id,
  acao: HistoricoAcao.ANALISE_CONCLUIDA, metadados: { providers: ['gemini'], totalMs: 1832 } });
console.log('\n✅ Historico criado:');
console.log(JSON.stringify(evento, null, 2));

console.log('\n═══════════════════════════════════════════════════');
console.log('✅ Todos os models funcionando corretamente!\n');
