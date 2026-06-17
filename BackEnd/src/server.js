import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import imageRoutes from './routes/imageRoutes.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); 
app.use(express.json()); 

// Rota de Teste (Health Check)
app.get('/', (req, res) => {
    res.json({ status: 'online', message: 'Servidor do SmartDem AI rodando com sucesso! 🚀' });
});

app.use('/api', imageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
