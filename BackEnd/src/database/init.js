import pool from '../services/database.js';

export const inicializarBanco = async () => {
    const client = await pool.connect();
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                senha_hash VARCHAR(255) NOT NULL,
                tipo_conta VARCHAR(50) NOT NULL,
                identificador VARCHAR(255),
                genero VARCHAR(50),
                endereco TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS consultas (
                id SERIAL PRIMARY KEY,
                nome_paciente VARCHAR(255) NOT NULL,
                paciente_id INTEGER REFERENCES usuarios(id),
                status VARCHAR(50) DEFAULT 'pendente',
                laudo_medico TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS mensagens (
                id SERIAL PRIMARY KEY,
                consulta_id INTEGER REFERENCES consultas(id) ON DELETE CASCADE,
                role VARCHAR(50) NOT NULL,
                texto TEXT,
                imagem_url TEXT,
                ia_utilizada VARCHAR(100),
                prompt_utilizado VARCHAR(255),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS engenharia_prompts (
                id SERIAL PRIMARY KEY,
                titulo VARCHAR(255) NOT NULL,
                chave_identificadora VARCHAR(100) UNIQUE NOT NULL,
                comando_base TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            INSERT INTO engenharia_prompts (titulo, chave_identificadora, comando_base)
            VALUES ('Padrão Dermatológico', 'padrao', 'Aja como um dermatologista especialista. Analise a imagem dermatológica fornecida e descreva as características visuais observadas, possíveis diagnósticos diferenciais e recomendações de conduta clínica. Seja técnico, preciso e objetivo.')
            ON CONFLICT (chave_identificadora) DO NOTHING;
        `);
        console.log('✅ Banco de dados inicializado com sucesso.');
    } finally {
        client.release();
    }
};
