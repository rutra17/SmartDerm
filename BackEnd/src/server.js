import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import imageRoutes from './routes/imageRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); 
app.use(express.json()); 

// Rota de Teste (Health Check)
app.get('/', (req, res) => {
    res.json({ status: 'online', message: 'Servidor do SmartDem AI rodando com sucesso! 🚀' });
});

// NOVO: Conectando a rota de upload (O prefixo será /api)
app.use('/api', imageRoutes);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
