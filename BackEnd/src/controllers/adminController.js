import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// 1. ESTATÍSTICAS GERAIS (Para o topo do painel Admin)
export const obterResumoGeral = async (req, res) => {
    try {
        const totalPacientes = await prisma.paciente.count();
        const totalMedicos = await prisma.medico.count();
        const totalCientistas = await prisma.cientista.count();
        const totalConsultas = await prisma.consulta.count();

        res.json({ totalPacientes, totalMedicos, totalCientistas, totalConsultas });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar resumo." });
    }
};

// 2. LEITURA (READ) - Buscar todos os utilizadores
export const listarTudo = async (req, res) => {
    try {
        const pacientes = await prisma.paciente.findMany({ orderBy: { criadoEm: 'desc' } });
        const medicos = await prisma.medico.findMany({ orderBy: { criadoEm: 'desc' } });
        const cientistas = await prisma.cientista.findMany({ orderBy: { criadoEm: 'desc' } });
        const consultas = await prisma.consulta.findMany({ 
            include: { paciente: true, medico: true },
            orderBy: { criadoEm: 'desc' } 
        });

        res.json({ pacientes, medicos, cientistas, consultas });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar dados." });
    }
};

// 3. CRIAÇÃO (CREATE) - Criar utilizadores manualmente
export const criarUsuario = async (req, res) => {
    const { tipo, username, senha, nome, email, extra } = req.body; 
    // "extra" pode ser CRM para médicos ou Instituição para cientistas

    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        let novoUsuario;
        if (tipo === 'medico') {
            novoUsuario = await prisma.medico.create({
                data: { username, senha: senhaHash, nome, email, crm: extra }
            });
        } else if (tipo === 'cientista') {
            novoUsuario = await prisma.cientista.create({
                data: { username, senha: senhaHash, nome, email, instituicao: extra }
            });
        } else {
            return res.status(400).json({ erro: "Tipo de utilizador inválido." });
        }

        res.status(201).json({ sucesso: true, usuario: novoUsuario });
    } catch (error) {
        console.error("Erro ao criar utilizador:", error);
        res.status(500).json({ erro: "Erro ao criar. Verifique se Username ou Email já existem." });
    }
};

// 4. EXCLUSÃO (DELETE) - O Poder Absoluto
export const deletarEntidade = async (req, res) => {
    const { tipo, id } = req.params;

    try {
        if (tipo === 'paciente') {
            await prisma.paciente.delete({ where: { id } });
        } else if (tipo === 'medico') {
            await prisma.medico.delete({ where: { id } });
        } else if (tipo === 'cientista') {
            await prisma.cientista.delete({ where: { id } });
        } else if (tipo === 'consulta') {
            await prisma.consulta.delete({ where: { id } });
        } else {
            return res.status(400).json({ erro: "Tipo inválido." });
        }
        res.json({ sucesso: true, mensagem: `${tipo} apagado com sucesso.` });
    } catch (error) {
        console.error("Erro ao apagar:", error);
        res.status(500).json({ erro: `Erro ao apagar ${tipo}. Podem existir dados dependentes.` });
    }
};