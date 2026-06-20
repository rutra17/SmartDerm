import { PrismaClient } from '@prisma/client';
import { minioClient } from '../services/minioClient.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

const prisma = new PrismaClient();
const BUCKET_NAME = 'imagens-medicas';

// Inicializa a IA do Google com a sua chave
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const criarConsulta = async (req, res) => {
    try {
        const { nome_paciente, medicoId } = req.body; // Agora recebe o medicoId
        const novaConsulta = await prisma.consulta.create({
            data: {
                nome_paciente,
                pacienteId: req.usuario.id,
                medicoId: medicoId || null // Guarda o médico escolhido, ou nulo se não escolheu
            }
        });
        res.status(201).json(novaConsulta);
    } catch (error) {
        console.error("Erro ao criar consulta:", error);
        res.status(500).json({ erro: "Erro ao criar consulta" });
    }
};

export const listarConsultas = async (req, res) => {
    try {
        const consultas = await prisma.consulta.findMany({
            where: { pacienteId: req.usuario.id },
            orderBy: { criadoEm: 'desc' }
        });
        res.json(consultas);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar histórico" });
    }
};

export const listarMensagens = async (req, res) => {
    try {
        const { id } = req.params;
        const mensagens = await prisma.mensagem.findMany({
            where: { consultaId: id },
            orderBy: { criadoEm: 'asc' }
        });
        res.json(mensagens);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar mensagens" });
    }
};

export const listarMedicos = async (req, res) => {
    try {
        const medicos = await prisma.medico.findMany({
            select: { id: true, nome: true, crm: true }
        });
        res.json(medicos);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar a lista de médicos." });
    }
};

export const enviarMensagem = async (req, res) => {
    try {
        const { consultaId, texto, ia_utilizada, prompt_utilizado } = req.body;
        const imagem = req.file; 

        let imagemUrl = null;
        let conteudoParaIA = [];

        const temRelato = texto && texto.trim() !== "" && texto.trim() !== "Imagem enviada para triagem.";
        const textoDoPaciente = temRelato ? texto.trim() : "Imagem enviada para triagem.";

        // ---------------------------------------------------------
        // 1. ENGENHARIA DE PROMPTS (Buscando do PostgreSQL)
        // ---------------------------------------------------------
        // Fallback de segurança absoluto (caso o banco de dados falhe ou o prompt seja apagado)
        let instrucaoEspecial = "Você é um assistente de pré-triagem dermatológica. Forneça uma análise clínica objetiva, educada e preliminar da lesão mostrada.";

        try {
            // Procura a instrução exata que o usuário selecionou no Front-End
            const promptDb = await prisma.prompt.findUnique({
                where: { chave: prompt_utilizado }
            });

            if (promptDb && promptDb.ativo) {
                instrucaoEspecial = promptDb.instrucao;
            } else if (prompt_utilizado !== 'padrao') {
                // Se a IA pedir um prompt que foi apagado/desativado, tenta puxar o padrão
                const promptPadrao = await prisma.prompt.findUnique({
                    where: { chave: 'padrao' }
                });
                if (promptPadrao && promptPadrao.ativo) {
                    instrucaoEspecial = promptPadrao.instrucao;
                }
            }
        } catch (dbError) {
            console.error("Erro ao buscar prompt dinâmico, usando rede de segurança:", dbError);
        }

        // ---------------------------------------------------------
        // 2. A MÁGICA DO CONTEXTO
        // ---------------------------------------------------------
        let textoFinalParaIA = `[INSTRUÇÃO DE SISTEMA]: ${instrucaoEspecial}\n\n`;

        if (temRelato) {
            textoFinalParaIA += `[CONTEXTO CLÍNICO]: O paciente relatou a seguinte história sobre a lesão: "${textoDoPaciente}". Por favor, correlacione obrigatoriamente este relato com os achados visuais na imagem de forma empática e clínica.`;
        } else {
            textoFinalParaIA += `[CONTEXTO CLÍNICO]: O paciente não enviou nenhuma história clínica ou relato em texto, forneceu apenas a imagem. Faça a sua análise baseando-se estritamente na avaliação morfológica visual da imagem.`;
        }
        
        conteudoParaIA.push(textoFinalParaIA);

        // ---------------------------------------------------------
        // 3. PROCESSAMENTO DA IMAGEM E MINIO
        // ---------------------------------------------------------
        if (imagem) {
            const extensao = imagem.originalname.split('.').pop();
            const nomeArquivo = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${extensao}`;

            await minioClient.putObject(BUCKET_NAME, nomeArquivo, imagem.buffer, imagem.size);
            imagemUrl = `http://localhost:9000/${BUCKET_NAME}/${nomeArquivo}`;

            conteudoParaIA.push({
                inlineData: {
                    data: imagem.buffer.toString("base64"),
                    mimeType: imagem.mimetype
                }
            });
        }

        // Grava a mensagem do Paciente no banco
        await prisma.mensagem.create({
            data: {
                consultaId,
                role: 'user',
                texto: textoDoPaciente,
                imagem_url: imagemUrl
            }
        });

        // ---------------------------------------------------------
        // 4. CHAMADA AO GOOGLE GEMINI
        // ---------------------------------------------------------
        let textoIA = "";
        let tempoDeProcessamento = 0; // 🌟 Variável do cronómetro
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            // ⏱️ Inicia o relógio
            const tempoInicio = Date.now();
            
            const result = await model.generateContent(conteudoParaIA);
            textoIA = result.response.text();
            
            // ⏱️ Para o relógio e calcula a diferença
            const tempoFim = Date.now();
            tempoDeProcessamento = tempoFim - tempoInicio;

        } catch (iaError) {
            console.error("Erro na API do Gemini:", iaError);
            textoIA = "⚠️ Erro: Falha ao gerar o laudo com a IA. A imagem e o seu relato foram guardados em segurança para análise médica humana.";
        }
        // Grava a resposta da IA no banco, AGORA COM A LATÊNCIA
        const iaMensagem = await prisma.mensagem.create({
            data: {
                consultaId,
                role: 'assistant',
                texto: textoIA,
                ia_utilizada: ia_utilizada || 'gemini',
                prompt_utilizado: prompt_utilizado || 'padrao',
                latenciaMs: tempoDeProcessamento > 0 ? tempoDeProcessamento : null // 🌟 Guarda o tempo no banco
            }
        });

        res.status(200).json({ sucesso: true, iaMensagem });

    } catch (error) {
        console.error("Erro no chat:", error);
        res.status(500).json({ erro: "Erro interno ao processar a mensagem." });
    }
};
// Busca os prompts ativos para exibir no menu do paciente
export const listarPromptsAtivos = async (req, res) => {
    try {
        const prompts = await prisma.prompt.findMany({
            where: { ativo: true },
            select: { titulo: true, chave: true }, // Só precisamos do nome e da chave para o menu
            orderBy: { criadoEm: 'asc' }
        });
        res.json(prompts);
    } catch (error) {
        console.error("Erro ao buscar prompts ativos:", error);
        res.status(500).json({ erro: "Erro ao buscar prompts." });
    }
};