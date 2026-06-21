import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ARTORIA';

// ========================================================
// 1. AUTENTICAÇÃO GERAL (O seu código original intacto)
// Usado por Pacientes, Médicos e Cientistas. Não quebra nada.
// ========================================================
export const autenticar = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: 'Token não fornecido. Acesso negado.' });
    }

    const token = authHeader.split(' ')[1]; // Separa a palavra "Bearer" do token real

    try {
        // Verifica se o token é válido e não expirou
        const payload = jwt.verify(token, JWT_SECRET);
        
        // Coloca os dados do usuário dentro da requisição para as próximas rotas usarem
        req.usuario = payload; 
        
        next(); // Deixa passar!
    } catch (error) {
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
};

// ========================================================
// 2. PROTEÇÃO DE ADMIN (A nova camada de segurança)
// Usado APENAS pelas rotas de administração.
// ========================================================
export const verificarAdmin = (req, res, next) => {
    console.log("[DEBUG] Alguém está a tentar aceder ao Painel Admin!");
    console.log("[DEBUG] O crachá (Token) diz que ele é:", req.usuario);

    if (req.usuario && req.usuario.tipo === 'admin') {
        console.log("[DEBUG] Tudo certo, ele é o Admin. Portas abertas!");
        next(); 
    } else {
        const tipoAtual = req.usuario ? req.usuario.tipo : 'Desconhecido';
        console.log(`[DEBUG] Bloqueado! Ele tentou entrar com cargo de: ${tipoAtual}`);
        
        return res.status(403).json({ 
            erro: `Acesso bloqueado! O sistema pensa que você é um(a) '${tipoAtual}' em vez de 'admin'.` 
        });
    }
};