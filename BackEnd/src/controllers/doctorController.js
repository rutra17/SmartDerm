import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Listar todas as consultas (Fila de Triagem)
export const listarFilaConsultas = async (req, res) => {
    try {
        // Bloqueio de Segurança: Apenas médicos podem aceder a esta rota
        if (req.usuario.tipo !== 'medico') {
            return res.status(403).json({ erro: "Acesso restrito. Apenas médicos podem ver a fila de triagem." });
        }

        const consultas = await prisma.consulta.findMany({
            orderBy: { criadoEm: 'desc' },
            include: {
                paciente: {
                    select: { nome: true, cpf: true, email: true } // Traz os dados do paciente junto com a consulta
                }
            }
        });
        
        res.json(consultas);
    } catch (error) {
        console.error("Erro ao buscar fila de consultas:", error);
        res.status(500).json({ erro: "Erro interno ao buscar a fila." });
    }
};

// 2. Abrir uma consulta específica para ler o Chat e ver a Foto
export const detalhesConsulta = async (req, res) => {
    try {
        const { id } = req.params;
        const consulta = await prisma.consulta.findUnique({
            where: { id },
            include: {
                paciente: { select: { nome: true, cpf: true, email: true } },
                mensagens: { orderBy: { criadoEm: 'asc' } } // Traz o histórico do chat em ordem
            }
        });

        if (!consulta) return res.status(404).json({ erro: "Consulta não encontrada." });

        res.json(consulta);
    } catch (error) {
        console.error("Erro ao buscar detalhes:", error);
        res.status(500).json({ erro: "Erro interno ao buscar detalhes da consulta." });
    }
};

// 3. O Médico envia o seu parecer final (Laudo)
export const salvarLaudo = async (req, res) => {
    try {
        const { id } = req.params;
        const { laudoMedico } = req.body;

        const consultaAtualizada = await prisma.consulta.update({
            where: { id },
            data: {
                laudoMedico,
                medicoId: req.usuario.id, // Grava qual médico atendeu
                status: 'finalizada'      // Muda o status da consulta
            }
        });

        res.json({ sucesso: true, consulta: consultaAtualizada });
    } catch (error) {
        console.error("Erro ao salvar laudo:", error);
        res.status(500).json({ erro: "Erro interno ao salvar o laudo." });
    }
};