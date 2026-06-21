import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import imageRoutes from './routes/imageRoutes.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import scientistRoutes from './routes/scientistRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { PrismaClient } from '@prisma/client';
import { setupSwagger } from './config/swagger.js';
import bcrypt from 'bcrypt';

dotenv.config();

const prismaClientAdmin = new PrismaClient();

async function injetarAdminMestre() {
    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash("admin123", salt);
        
        await prismaClientAdmin.admin.create({
            data: {
                username: "admin123",
                senha: senhaHash,
                nome: "Administrador"
            }
        });
        console.log("[DATABASE] Admin mestre garantido com sucesso no PostgreSQL!");
    } catch (error) {
        console.log("[DATABASE] Verificação de Admin concluída (Pronto para Login).");
    }
}
injetarAdminMestre();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); 
app.use(express.json());

setupSwagger(app);

app.get('/', (req, res) => {
    res.json({ status: 'online', message: 'Servidor do SmartDem AI rodando com sucesso!' });
});

app.use('/api', imageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);
app.use('/api', doctorRoutes);
app.use('/api', scientistRoutes);
app.use('/api/admin', adminRoutes);


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`📚 Documentação Swagger disponível em: http://localhost:${PORT}/api-docs`);
});
