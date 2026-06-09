import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'smartderm',
    password: process.env.DB_PASSWORD || 'smartderm123',
    database: process.env.DB_NAME || 'smartderm',
});

export default pool;
