import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ARTORIA';

export const autenticar = (req, res, next) => {
    // Pega o token do cabeçalho da requisição (ex: "Bearer eyJhbGciOi...")
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