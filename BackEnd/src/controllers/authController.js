import pool from '../services/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'smartderm_secret_dev';
const CODIGO_MEDICO = process.env.CODIGO_MEDICO || 'MEDICO2026';
const CODIGO_CIENTISTA = process.env.CODIGO_CIENTISTA || 'DATAADMIN2026';

function montarEmail(identificador, tipo_conta) {
    if (tipo_conta === 'paciente') {
        const cpf = identificador.replace(/\D/g, '');
        return `${cpf}@paciente.smartderm.com`;
    }
    if (tipo_conta === 'medico') {
        return `${identificador}@medico.smartderm.com`;
    }
    if (tipo_conta === 'cientista') {
        const user = identificador.toLowerCase().replace(/\s/g, '_');
        return `${user}@cientista.smartderm.com`;
    }
    return null;
}

export const register = async (req, res) => {
    const { nome, tipo_conta, identificador, senha, genero, endereco, codigo_autorizacao } = req.body;

    if (!nome || !tipo_conta || !identificador || !senha) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    if (tipo_conta === 'medico' && codigo_autorizacao !== CODIGO_MEDICO) {
        return res.status(403).json({ error: 'Código de autorização de médico inválido.' });
    }
    if (tipo_conta === 'cientista' && codigo_autorizacao !== CODIGO_CIENTISTA) {
        return res.status(403).json({ error: 'Código de autorização de pesquisador inválido.' });
    }

    const email = montarEmail(identificador, tipo_conta);
    if (!email) {
        return res.status(400).json({ error: 'Tipo de conta inválido.' });
    }

    try {
        const senha_hash = await bcrypt.hash(senha, 10);

        const result = await pool.query(
            `INSERT INTO usuarios (nome, email, senha_hash, tipo_conta, identificador, genero, endereco)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, nome, tipo_conta, identificador`,
            [nome, email, senha_hash, tipo_conta, identificador, genero || null, endereco || null]
        );

        return res.status(201).json({ message: 'Conta criada com sucesso!', user: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Utilizador já existe.' });
        }
        console.error('Erro no register:', error);
        return res.status(500).json({ error: 'Erro interno ao criar conta.' });
    }
};

export const login = async (req, res) => {
    const { identificador, tipo_conta, senha } = req.body;

    if (!identificador || !tipo_conta || !senha) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    const email = montarEmail(identificador, tipo_conta);
    if (!email) {
        return res.status(400).json({ error: 'Tipo de conta inválido.' });
    }

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciais incorretas ou utilizador não registado.' });
        }

        const user = result.rows[0];
        const senhaValida = await bcrypt.compare(senha, user.senha_hash);

        if (!senhaValida) {
            return res.status(401).json({ error: 'Credenciais incorretas ou utilizador não registado.' });
        }

        const token = jwt.sign(
            { id: user.id, tipo_conta: user.tipo_conta, nome: user.nome },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({
            token,
            user: {
                id: user.id,
                nome: user.nome,
                tipo_conta: user.tipo_conta,
                identificador: user.identificador,
            },
        });
    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ error: 'Erro interno ao fazer login.' });
    }
};
