import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'ARTORIA';

export const registrar = async (req, res) => {
    try {
        const { username, senha, nome, email, tipo, dadoEspecifico, genero, cep, endereco, referencia } = req.body;

        const usuarioExistente = await prisma.paciente.findUnique({ where: { username } }) ||
                                 await prisma.medico.findUnique({ where: { username } }) ||
                                 await prisma.cientista.findUnique({ where: { username } }) ||
                                 await prisma.admin.findUnique({ where: { username } });

        if (usuarioExistente) {
            return res.status(400).json({ erro: "Este utilizador já está registado." });
        }

        // Criptografa a senha (Bcrypt)
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        let novoUsuario;

        // Guarda o utilizador na tabela correta com TODOS os dados
        if (tipo === 'paciente') {
            novoUsuario = await prisma.paciente.create({
                data: {
                    username, senha: senhaHash, nome, email, cpf: dadoEspecifico, genero, cep, endereco, referencia
                }
            });
        } else if (tipo === 'medico') {
            novoUsuario = await prisma.medico.create({
                data: {
                    username, senha: senhaHash, nome, email, crm: dadoEspecifico, genero, cep, endereco, referencia
                }
            });
        } else if (tipo === 'cientista') {
            novoUsuario = await prisma.cientista.create({
                data: {
                    username, senha: senhaHash, nome, email, instituicao: dadoEspecifico, genero, cep, endereco, referencia
                }
            });
        } else {
            return res.status(400).json({ erro: "Tipo de conta inválido." });
        }

        // Resposta de Sucesso
        res.status(201).json({ 
            mensagem: `${tipo} registado com sucesso!`, 
            usuario: { id: novoUsuario.id, username, nome, tipo } 
        });

    } catch (error) {
        console.error("Erro no registo:", error);
        res.status(500).json({ erro: "Erro interno no servidor ao registar." });
    }
};

export const login = async (req, res) => {
    try {
        const { username, senha } = req.body;

        // Procura em qual tabela o utilizador está
        let usuario = await prisma.paciente.findUnique({ where: { username } });
        let tipo = 'paciente';

        if (!usuario) {
            usuario = await prisma.medico.findUnique({ where: { username } });
            tipo = 'medico';
        }

        if (!usuario) {
            usuario = await prisma.cientista.findUnique({ where: { username } });
            tipo = 'cientista';
        }

        if (!usuario) {
            usuario = await prisma.admin.findUnique({ where: { username } });
            tipo = 'admin';
        }

        if (!usuario) {
            return res.status(404).json({ erro: "Utilizador não encontrado." });
        }

        // Verifica se a senha bate com a criptografia
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ erro: "Senha incorreta." });
        }

        // Gera o "Crachá" (Token JWT)
        const token = jwt.sign(
            { id: usuario.id, username: usuario.username, tipo },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        if (tipoEncontrado !== 'admin') { // O Admin mestre não precisa de rastreio
            await prisma[tipoEncontrado].update({
                where: { id: usuarioEncontrado.id },
                data: { isOnline: true, ultimoLogin: new Date() }
            });
        }

        res.json({ token, usuario: { nome: usuarioEncontrado.nome, tipo: tipoEncontrado } });

        res.status(200).json({
            mensagem: "Login realizado com sucesso!",
            token,
            usuario: { id: usuario.id, nome: usuario.nome, tipo }
        });

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ erro: "Erro interno no servidor ao fazer login." });
    }
};

export const logout = async (req, res) => {
    try {
        const { id, tipo } = req.usuario; // Vem do token validado
        
        if (tipo !== 'admin') {
            await prisma[tipo].update({
                where: { id },
                data: { isOnline: false, ultimoLogout: new Date() }
            });
        }
        res.json({ sucesso: true, mensagem: "Sessão encerrada." });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao encerrar sessão." });
    }
};

export const registrarPorConvite = async (req, res) => {
    const { token, nome, medicoId } = req.body;

    try {
        const convite = await prisma.convite.findUnique({ where: { token } });

        if (!convite || convite.usado || new Date() > convite.expiraEm) {
            return res.status(400).json({ erro: "Convite inválido ou expirado." });
        }

        // Auto-gera dados obrigatórios que o paciente não preencheu
        const usernameGerado = `pac_${Date.now().toString().slice(-6)}`;
        const senhaHash = await bcrypt.hash('smartderm123', 10);
        const emailGerado = `${usernameGerado}@smartderm.local`;

        const novoPaciente = await prisma.paciente.create({
            data: {
                nome,
                username: usernameGerado,
                senha: senhaHash,
                email: emailGerado,
                isOnline: true,
                ultimoLogin: new Date()
            }
        });

        // Se ele escolheu um médico, criamos logo uma Consulta/Triagem inicial!
        if (medicoId) {
            await prisma.consulta.create({
                data: { pacienteId: novoPaciente.id, medicoId, status: "pendente" }
            });
        }

        // Invalida o convite
        await prisma.convite.update({ where: { id: convite.id }, data: { usado: true } });

        // Gera token de login automático
        const jwtToken = jwt.sign(
            { id: novoPaciente.id, tipo: 'paciente' }, 
            process.env.JWT_SECRET || 'chave_super_secreta', 
            { expiresIn: '24h' }
        );

        res.status(201).json({ sucesso: true, token: jwtToken, paciente: novoPaciente });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao registar paciente." });
    }
};