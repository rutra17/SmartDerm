import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import imageRoutes from './routes/imageRoutes.js';
import authRoutes from './routes/authRoutes.js';
import consultasRoutes from './routes/consultasRoutes.js';
import mensagensRoutes from './routes/mensagensRoutes.js';
import promptsRoutes from './routes/promptsRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import { inicializarBanco } from './database/init.js';
import convitesRoutes from './routes/convites.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: 'online', message: 'SmartDerm AI rodando! 🚀' });
});

app.use('/api', imageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/consultas', consultasRoutes);
app.use('/api/mensagens', mensagensRoutes);
app.use('/api/prompts', promptsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/convites', convitesRoutes);

inicializarBanco()
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Falha ao iniciar o servidor:', err);
        process.exit(1);
    });
