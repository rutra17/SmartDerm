import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import imageRoutes from './routes/imageRoutes.js'; // NOVO: Importando suas rotas

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json()); 

// Rota de Teste (Health Check)
app.get('/', (req, res) => {
    res.json({ status: 'online', message: 'Servidor do SmartDem AI rodando com sucesso! 🚀' });
});

// NOVO: Conectando a rota de upload (O prefixo será /api)
app.use('/api', imageRoutes);

app.listen(PORT, () => {
    console.log(`✅ Servidor Back-End rodando na porta ${PORT}`);
    console.log(`🔗 Acesse para testar: http://localhost:${PORT}`);
});