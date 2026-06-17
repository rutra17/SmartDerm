import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
// Em produção, isto deve vir do seu ficheiro .env no Coolify
const JWT_SECRET = process.env.JWT_SECRET || 'ARTORIA';

export const login = async (req, res) => {
    try {
        const { username, senha } = req.body;

        if (!username || !senha) {
            return res.status(400).json({ erro: 'Username e senha são obrigatórios.' });
        }

        // 1. Procurar o utilizador (Vamos checar as 3 tabelas)
        let usuario = await prisma.paciente.findUnique({ where: { username } });
        let tipoUsuario = 'paciente';

        if (!usuario) {
            usuario = await prisma.medico.findUnique({ where: { username } });
            tipoUsuario = 'medico';
        }

        if (!usuario) {
            usuario = await prisma.cientista.findUnique({ where: { username } });
            tipoUsuario = 'cientista';
        }

        // 2. Se o username não existir em nenhuma tabela
        if (!usuario) {
            return res.status(401).json({ erro: 'Usuário não encontrado.' });
        }

        // 3. Verificar se a senha está correta (Bcrypt compara o texto com o Hash do banco)
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) {
            return res.status(401).json({ erro: 'Senha incorreta.' });
        }

        // 4. Gerar o JWT (O Crachá Digital)
        const token = jwt.sign(
            { 
                id: usuario.id, 
                username: usuario.username, 
                tipo: tipoUsuario // Guardamos o tipo para saber o que ele pode acessar
            },
            JWT_SECRET,
            { expiresIn: '24h' } // O token expira em 24 horas por segurança
        );

        // 5. Devolver o token e os dados básicos para o Front-End
        res.json({
            mensagem: 'Login realizado com sucesso!',
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                tipo: tipoUsuario
            }
        });

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};
export const registrar = async (req, res) => {
    try {
        const { username, senha, nome, email, tipo, dadoEspecifico } = req.body;

        if (!username || !senha || !nome || !email || !tipo) {
            return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
        }

        // 1. Criptografar a senha antes de guardar!
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        let novoUsuario;

        // 2. Guardar na tabela correta dependendo do tipo
        if (tipo === 'paciente') {
            novoUsuario = await prisma.paciente.create({
                data: {
                    username,
                    senha: senhaHash,
                    nome,
                    email,
                    cpf: dadoEspecifico,
                    genero,          
                    cep,              
                    endereco,         
                    referencia        
                }
            });
        } else if (tipo === 'medico') {
            novoUsuario = await prisma.medico.create({
                data: {
                    username,
                    senha: senhaHash,
                    nome,
                    email,
                    crm: dadoEspecifico,
                    genero,           
                    cep,              
                    endereco,         
                    referencia        
                }
            });
        } else {
            return res.status(400).json({ erro: 'Tipo de utilizador inválido. Use paciente ou medico.' });
        }

        // 3. Devolver sucesso sem mostrar a senha!
        res.status(201).json({
            mensagem: `${tipo} registado com sucesso!`,
            usuario: {
                id: novoUsuario.id,
                username: novoUsuario.username,
                nome: novoUsuario.nome
            }
        });

    } catch (error) {
        console.error("Erro no registo:", error);
        // O código P2002 do Prisma significa que um campo @unique (como username ou email) já existe
        if (error.code === 'P2002') {
            return res.status(400).json({ erro: 'Este username ou email já está em uso.' });
        }
        res.status(500).json({ erro: 'Erro interno no servidor ao registar.' });
    }
};