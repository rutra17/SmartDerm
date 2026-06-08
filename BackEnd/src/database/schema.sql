-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    tipo_conta VARCHAR(20) NOT NULL CHECK (tipo_conta IN ('paciente', 'medico', 'cientista')),
    identificador VARCHAR(255) NOT NULL,
    genero VARCHAR(50),
    endereco TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de consultas
CREATE TABLE IF NOT EXISTS consultas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID REFERENCES usuarios(id),
    medico_id UUID REFERENCES usuarios(id),
    nome_paciente VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'finalizada')),
    laudo_medico TEXT,
    titulo VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consulta_id UUID REFERENCES consultas(id),
    role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
    texto TEXT NOT NULL,
    ia_utilizada VARCHAR(50),
    prompt_utilizado VARCHAR(100),
    imagem_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de laudos
CREATE TABLE IF NOT EXISTS laudos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consulta_id UUID REFERENCES consultas(id),
    paciente_id UUID REFERENCES usuarios(id),
    medico_id UUID REFERENCES usuarios(id),
    texto_ia TEXT NOT NULL,
    ia_utilizada VARCHAR(50) NOT NULL,
    prompt_utilizado VARCHAR(100),
    imagem_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de prompts de engenharia
CREATE TABLE IF NOT EXISTS engenharia_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave_identificadora VARCHAR(100) UNIQUE NOT NULL,
    titulo VARCHAR(255) NOT NULL DEFAULT '',
    comando_base TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Migrações seguras para bancos já existentes
ALTER TABLE engenharia_prompts ADD COLUMN IF NOT EXISTS titulo VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE consultas ADD COLUMN IF NOT EXISTS laudo_medico TEXT;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS senha_hash TEXT NOT NULL DEFAULT '';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS genero VARCHAR(50);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS endereco TEXT;

-- Prompt padrão
INSERT INTO engenharia_prompts (chave_identificadora, titulo, comando_base)
VALUES (
    'padrao',
    'Análise ABCDE Padrão',
    'Aja como um dermatologista especialista. Analise a imagem dermatológica fornecida com base nos critérios ABCDE (Assimetria, Bordas, Cores, Diâmetro, Evolução) e forneça uma avaliação técnica detalhada.'
)
ON CONFLICT (chave_identificadora) DO NOTHING;
