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
        const { nome_paciente } = req.body;
        const novaConsulta = await prisma.consulta.create({
            data: { nome_paciente, pacienteId: req.usuario.id }
        });
        res.status(201).json(novaConsulta);
    } catch (error) {
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

export const enviarMensagem = async (req, res) => {
    try {
        const { consultaId, texto, ia_utilizada, prompt_utilizado } = req.body;
        const imagem = req.file; 

        let imagemUrl = null;
        let conteudoParaIA = [];

        // 1. O paciente enviou texto? Adiciona ao pacote da IA.
        const textoUsuario = texto || "Por favor, analise esta imagem dermatológica e indique possíveis características clínicas de forma preliminar.";
        conteudoParaIA.push(textoUsuario);

        // 2. O paciente enviou foto? Guarda no MinIO e prepara para o Gemini.
        if (imagem) {
            const extensao = imagem.originalname.split('.').pop();
            const nomeArquivo = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${extensao}`;

            // Guarda no MinIO
            await minioClient.putObject(BUCKET_NAME, nomeArquivo, imagem.buffer, imagem.size);
            imagemUrl = `http://localhost:9000/${BUCKET_NAME}/${nomeArquivo}`;

            // Prepara a foto para a IA (Formato InlineData que o Gemini exige)
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
                texto: textoUsuario,
                imagem_url: imagemUrl
            }
        });

        // 3. O MOMENTO DA VERDADE: Chama o Google Gemini
        let textoIA = "";
        try {
            // Usamos o modelo flash por ser o mais rápido e preparado para visão (fotos)
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const result = await model.generateContent(conteudoParaIA);
            textoIA = result.response.text();
        } catch (iaError) {
            console.error("Erro na API do Gemini:", iaError);
            textoIA = "Peço desculpa, mas o meu sistema de análise visual está temporariamente indisponível. A sua imagem foi guardada e um médico humano irá avaliá-la em breve.";
        }

        // 4. Grava a resposta magistral da IA no banco
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