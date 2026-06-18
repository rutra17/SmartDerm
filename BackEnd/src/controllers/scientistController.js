import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Bloqueio de Segurança para garantir que só o Cientista entra
export const verificarCientista = (req, res, next) => {
    if (req.usuario.tipo !== 'cientista') {
        return res.status(403).json({ erro: "Acesso restrito a Cientistas de Dados." });
    }
    next();
};

// 1. LER (Read) - Lista todos os prompts
export const listarPrompts = async (req, res) => {
    try {
        const prompts = await prisma.prompt.findMany({ orderBy: { criadoEm: 'desc' } });
        res.json(prompts);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar prompts." });
    }
};

// 2. CRIAR (Create) - Adiciona uma nova instrução
export const criarPrompt = async (req, res) => {
    try {
        const { titulo, chave, instrucao, ativo } = req.body;
        const novoPrompt = await prisma.prompt.create({
            // Se ativo não for enviado, o padrão é true
            data: { titulo, chave, instrucao, ativo: ativo !== undefined ? ativo : true } 
        });
        res.status(201).json(novoPrompt);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao criar prompt. Verifique se a chave já existe." });
    }
};

// 3. ATUALIZAR (Update) - Edita um prompt existente
export const atualizarPrompt = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, chave, instrucao, ativo } = req.body;
        const promptAtualizado = await prisma.prompt.update({
            where: { id },
            data: { titulo, chave, instrucao, ativo }
        });
        res.json(promptAtualizado);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao atualizar prompt." });
    }
};

// 4. DELETAR (Delete) - Remove o prompt permanentemente
export const deletarPrompt = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.prompt.delete({ where: { id } });
        res.json({ sucesso: true, mensagem: "Prompt removido." });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao deletar prompt." });
    }
};

// 5. ESTATÍSTICAS (Para o Dashboard e Custos)
export const obterEstatisticas = async (req, res) => {
    try {
        const consultas = await prisma.consulta.findMany();
        const mensagens = await prisma.mensagem.findMany({
            where: { role: 'assistant' } // Pega só as respostas da IA
        });
        const imagens = await prisma.mensagem.findMany({
            where: { imagem_url: { not: null } }
        });

        let contagemStatus = { pendente: 0, finalizada: 0 };
        consultas.forEach(c => {
            contagemStatus[c.status] = (contagemStatus[c.status] || 0) + 1;
        });

        let contagemModelos = {};
        let contagemPrompts = {};
        
        mensagens.forEach(msg => {
            const modelo = msg.ia_utilizada || 'Desconhecido';
            const prompt = msg.prompt_utilizado || 'padrao';
            
            contagemModelos[modelo] = (contagemModelos[modelo] || 0) + 1;
            contagemPrompts[prompt] = (contagemPrompts[prompt] || 0) + 1;
        });

        res.json({
            totalConsultas: consultas.length,
            totalMensagensIA: mensagens.length,
            totalImagens: imagens.length,
            statusConsultas: contagemStatus,
            modelosIA: contagemModelos,
            promptsUtilizados: contagemPrompts
        });

    } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        res.status(500).json({ erro: "Erro ao buscar estatísticas." });
    }
};