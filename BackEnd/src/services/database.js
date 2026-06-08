import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Pool de conexões com o PostgreSQL local
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'smartderm',
    password: process.env.DB_PASSWORD || 'smartderm123',
    database: process.env.DB_NAME || 'smartderm',
});

pool.on('connect', () => {
    console.log('✅ Conectado ao PostgreSQL!');
});

pool.on('error', (err) => {
    console.error('❌ Erro no PostgreSQL:', err);
});

export default pool;
