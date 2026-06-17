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

        // 1. Verifica se o paciente realmente escreveu algo ou se só mandou a foto
        // (O Front-End envia "Imagem enviada para triagem." quando o campo de texto está vazio)
        const temRelato = texto && texto.trim() !== "" && texto.trim() !== "Imagem enviada para triagem.";
        const textoDoPaciente = temRelato ? texto.trim() : "Imagem enviada para triagem.";

        // ---------------------------------------------------------
        // 2. ENGENHARIA DE PROMPTS (A "Personalidade" da IA)
        // ---------------------------------------------------------
        let instrucaoEspecial = "";
        
        switch (prompt_utilizado) {
            case 'urgencia':
                instrucaoEspecial = "Você é um médico especialista em triagem de emergência dermatológica. A sua análise deve focar EXCLUSIVAMENTE em identificar ou descartar sinais de alerta vermelho (ex: ABCDE do melanoma avançado, necrose, infecção grave). Seja curto, direto e classifique o nível de urgência imediatamente.";
                break;
            case 'detalhado':
                instrucaoEspecial = "Você é um Dermatologista Sênior e Acadêmico. Faça um relatório exaustivo, técnico e estruturado contendo obrigatoriamente: 1. Descrição Morfológica Detalhada, 2. Análise de Bordas e Padrão de Cores, 3. Lista de Diagnósticos Diferenciais (do mais provável ao menos provável) com justificativas, 4. Próximos passos recomendados para biópsia ou conduta.";
                break;
            default: // 'padrao'
                instrucaoEspecial = "Você é um assistente de pré-triagem dermatológica. Forneça uma análise clínica objetiva, educada e preliminar da lesão mostrada, listando possíveis hipóteses comuns.";
        }

        // 3. A MÁGICA DO CONTEXTO (Juntando a história com as instruções)
        let textoFinalParaIA = `[INSTRUÇÃO DE SISTEMA]: ${instrucaoEspecial}\n\n`;

        if (temRelato) {
            textoFinalParaIA += `[CONTEXTO CLÍNICO]: O paciente relatou a seguinte história sobre a lesão: "${textoDoPaciente}". Por favor, correlacione obrigatoriamente este relato com os achados visuais na imagem de forma empática e clínica.`;
        } else {
            textoFinalParaIA += `[CONTEXTO CLÍNICO]: O paciente não enviou nenhuma história clínica ou relato em texto, forneceu apenas a imagem. Faça a sua análise baseando-se estritamente na avaliação morfológica visual da imagem.`;
        }
        
        conteudoParaIA.push(textoFinalParaIA);

        // ---------------------------------------------------------
        // 4. PROCESSAMENTO DA IMAGEM E MINIO
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
        // 5. CHAMADA AO GOOGLE GEMINI
        // ---------------------------------------------------------
        let textoIA = "";
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(conteudoParaIA);
            textoIA = result.response.text();
        } catch (iaError) {
            console.error("Erro na API do Gemini:", iaError);
            textoIA = "⚠️ Erro: Falha ao gerar o laudo com a IA. A imagem e o seu relato foram guardados em segurança para análise médica humana.";
        }

        // Grava a resposta da IA no banco
        const iaMensagem = await prisma.mensagem.create({
            data: {
                consultaId,
                role: 'assistant',
                texto: textoIA,
                ia_utilizada: ia_utilizada || 'gemini',
                prompt_utilizado: prompt_utilizado || 'padrao'
            }
        });

        res.status(200).json({ sucesso: true, iaMensagem });

    } catch (error) {
        console.error("Erro no chat:", error);
        res.status(500).json({ erro: "Erro interno ao processar a mensagem." });
    }
};