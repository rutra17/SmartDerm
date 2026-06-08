import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from '../services/database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Executa o schema SQL para criar as tabelas se não existirem
export async function inicializarBanco() {
    try {
        const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
        await pool.query(sql);
        console.log('✅ Banco de dados inicializado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
        throw error;
    }
}
