# SmartDerm AI

Sistema de triagem dermatológica assistida por inteligência artificial. Integra Visão Computacional e Modelos de Linguagem de Grande Escala (LLMs/VLMs) para analisar imagens de lesões de pele e gerar relatórios diagnósticos estruturados e explicáveis — preenchendo a lacuna entre a predição da máquina e a compreensão do profissional de saúde.

---

## Funcionalidades

- Paciente envia foto da lesão junto com um relato textual
- IA analisa a imagem com base nos critérios ABCDE (Assimetria, Bordas, Cores, Diâmetro, Evolução)
- Médico acessa fila de triagens, revisa o pré-diagnóstico da IA e emite laudo final
- Suporte a múltiplos modelos de IA: Claude (Anthropic), Gemini (Google), OpenAI e DeepSeek
- Prompts customizáveis por sessão
- Histórico completo de consultas e mensagens

---

## Papéis de Usuário

| Papel | Identificador no cadastro | Token de registro |
|---|---|---|
| Paciente | CPF (formato: 000.000.000-00) | — |
| Médico | CRM/CRN (8 dígitos) | `MEDICO2026` |
| Cientista de Dados | Username livre | `DATAADMIN2026` |

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | Node.js + Express 5 |
| Banco de dados | PostgreSQL 16 |
| Armazenamento de imagens | MinIO (compatível com S3) |
| Autenticação | JWT + bcryptjs |
| Infraestrutura | Docker + Docker Compose |
| IA | Claude, Gemini, OpenAI, DeepSeek |

---

## Estrutura do Projeto

```
SmartDerm/
├── docker-compose.yml        # Orquestração de todos os serviços
├── BackEnd/
│   ├── dockerfile
│   ├── package.json
│   └── src/
│       ├── server.js                    # Entry point do servidor
│       ├── controllers/
│       │   ├── authController.js        # Login e registro
│       │   ├── imageController.js       # Upload e análise por IA
│       │   ├── consultasController.js   # Gestão de consultas
│       │   ├── mensagensController.js   # Histórico de mensagens
│       │   └── promptsController.js     # CRUD de prompts
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── imageRoutes.js
│       │   ├── consultasRoutes.js
│       │   ├── mensagensRoutes.js
│       │   └── promptsRoutes.js
│       ├── middlewares/
│       │   ├── authMiddleware.js        # Validação JWT
│       │   └── upload.js               # Multer (recepção de imagens)
│       ├── providers/
│       │   ├── ai/                      # Claude, Gemini, OpenAI, DeepSeek
│       │   └── storage/                 # MinIO
│       ├── services/
│       │   └── database.js              # Pool de conexões PostgreSQL
│       └── database/
│           ├── schema.sql               # Definição das tabelas
│           └── init.js                  # Inicialização automática
└── FrontEnd/
    ├── dockerfile
    ├── package.json
    └── src/
        ├── app.jsx
        ├── pages/
        │   ├── PatientChat.jsx
        │   ├── DoctorPanel.jsx
        │   ├── Register.jsx
        │   └── ScientistDashboard.jsx
        ├── components/
        └── services/
            └── api.js
```

---

## Banco de Dados

O banco de dados utilizado é o **PostgreSQL 16**, rodando em container Docker. A inicialização é **automática**: ao subir o backend, ele executa o arquivo `schema.sql` e cria todas as tabelas se ainda não existirem, além de inserir o prompt padrão.

### Tabelas

#### `usuarios`
Armazena todos os usuários do sistema, independente do papel.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Gerado automaticamente |
| nome | VARCHAR(255) | Nome completo |
| email | VARCHAR(255) | Único, usado no login |
| senha_hash | TEXT | Senha criptografada com bcrypt |
| tipo_conta | VARCHAR(20) | `paciente`, `medico` ou `cientista` |
| identificador | VARCHAR(255) | CPF, CRM ou username |
| genero | VARCHAR(50) | Opcional |
| endereco | TEXT | Opcional |
| created_at | TIMESTAMP | Data de criação |

#### `consultas`
Representa uma sessão de triagem entre paciente e IA, revisada pelo médico.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Gerado automaticamente |
| paciente_id | UUID (FK) | Referência ao usuário paciente |
| medico_id | UUID (FK) | Referência ao médico responsável |
| nome_paciente | VARCHAR(255) | Nome para exibição |
| titulo | VARCHAR(255) | Título da consulta |
| status | VARCHAR(20) | `pendente` ou `finalizada` |
| laudo_medico | TEXT | Parecer escrito pelo médico |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Última atualização |

#### `mensagens`
Histórico de mensagens de cada consulta (conversa entre paciente e IA).

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Gerado automaticamente |
| consulta_id | UUID (FK) | Referência à consulta |
| role | VARCHAR(10) | `user` (paciente) ou `assistant` (IA) |
| texto | TEXT | Conteúdo da mensagem |
| ia_utilizada | VARCHAR(50) | Nome do modelo usado (ex: `claude`, `gemini`) |
| prompt_utilizado | VARCHAR(100) | Chave do prompt aplicado |
| imagem_url | TEXT | URL da imagem no MinIO |
| created_at | TIMESTAMP | Data de criação |

#### `laudos`
Registro consolidado do diagnóstico gerado pela IA em cada consulta.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Gerado automaticamente |
| consulta_id | UUID (FK) | Referência à consulta |
| paciente_id | UUID (FK) | Referência ao paciente |
| medico_id | UUID (FK) | Referência ao médico |
| texto_ia | TEXT | Análise gerada pela IA |
| ia_utilizada | VARCHAR(50) | Modelo de IA utilizado |
| prompt_utilizado | VARCHAR(100) | Prompt aplicado |
| imagem_url | TEXT | URL da imagem analisada |
| created_at | TIMESTAMP | Data de criação |

#### `engenharia_prompts`
Prompts customizáveis que orientam o comportamento da IA na análise.

| Coluna | Tipo | Descrição |
|---|---|---|
| id | UUID (PK) | Gerado automaticamente |
| chave_identificadora | VARCHAR(100) | Identificador único (ex: `padrao`) |
| titulo | VARCHAR(255) | Nome exibido na interface |
| comando_base | TEXT | Instrução enviada à IA |
| created_at | TIMESTAMP | Data de criação |

O sistema já insere automaticamente o seguinte prompt padrão na primeira inicialização:

> *"Aja como um dermatologista especialista. Analise a imagem dermatológica fornecida com base nos critérios ABCDE (Assimetria, Bordas, Cores, Diâmetro, Evolução) e forneça uma avaliação técnica detalhada."*

### Diagrama de Relacionamentos

```
usuarios (paciente) ──┐
                      ├──> consultas <── usuarios (medico)
                      │        │
                      │        ├──> mensagens
                      │        └──> laudos
                      └──────────────────┘

engenharia_prompts (referenciado por mensagens e laudos via chave_identificadora)
```

---

## Docker Compose

O arquivo `docker-compose.yml` sobe **4 serviços** com uma única linha de comando.

```yaml
services:
  postgres:    # Banco de dados
  minio:       # Armazenamento de imagens
  backend:     # API Node.js
  frontend:    # Interface React
```

### Serviços

#### `postgres` — Banco de Dados
- **Imagem:** `postgres:16`
- **Porta:** `5432`
- **Banco:** `smartderm`
- **Usuário:** `smartderm` / **Senha:** `smartderm123`
- **Volume persistente:** `postgres_data` (os dados sobrevivem ao reinício dos containers)

#### `minio` — Armazenamento de Imagens
- **Imagem:** `quay.io/minio/minio`
- **Porta da API:** `9000`
- **Porta do console web:** `9001`
- **Usuário:** `minioadmin` / **Senha:** `minioadmin`
- **Bucket:** `smartderm`
- **Volume persistente:** `minio_data`
- O MinIO é compatível com a API do Amazon S3, facilitando uma eventual migração para a nuvem.

#### `backend` — API Node.js
- **Porta:** `3000`
- Depende de `postgres` e `minio` estarem rodando
- Recebe as chaves de API dos modelos de IA via variáveis de ambiente
- Na inicialização, executa o `schema.sql` automaticamente

#### `frontend` — Interface React
- **Porta:** `5173`
- Depende do `backend` estar rodando
- Se comunica com o backend via `http://backend:3000` (rede interna do Docker)

### Volumes

```yaml
volumes:
  postgres_data:   # Dados do PostgreSQL
  minio_data:      # Imagens armazenadas no MinIO
```

Os volumes são gerenciados pelo Docker e garantem que os dados não sejam perdidos ao parar ou reiniciar os containers.

---

## Como Executar

### Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose instalados
- Chaves de API dos modelos de IA desejados

### 1. Configurar as chaves de API

No arquivo `docker-compose.yml`, substitua `sua_chave_aqui` pelas chaves reais:

```yaml
- GEMINI_API_KEY=sua_chave_aqui
- DEEPSEEK_API_KEY=sua_chave_aqui
- OPENAI_API_KEY=sua_chave_aqui
- ANTHROPIC_API_KEY=sua_chave_aqui
```

> **Recomendado:** crie um arquivo `.env` na raiz (já está no `.gitignore`) e use variáveis de ambiente em vez de colocar as chaves diretamente no `docker-compose.yml`.

### 2. Subir todos os serviços

```bash
docker-compose up -d
```

O banco de dados será criado e as tabelas inicializadas automaticamente.

### 3. Acessar a aplicação

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend (API) | http://localhost:3000 |
| MinIO Console | http://localhost:9001 |
| PostgreSQL | localhost:5432 |

### Parar os serviços

```bash
docker-compose down
```

Para remover também os volumes (apaga todos os dados):

```bash
docker-compose down -v
```

---

## API — Endpoints

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Cadastro de novo usuário |
| POST | `/api/auth/login` | Login (retorna JWT) |

### Upload e Análise por IA
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/upload` | Envia imagem e recebe análise da IA |

Body: `multipart/form-data` com os campos `imagem`, `userText`, `aiModel`, `promptKey`, `consultaId`.

### Consultas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/consultas` | Lista todas as consultas |
| POST | `/api/consultas` | Cria nova consulta |
| PUT | `/api/consultas/:id` | Atualiza consulta (laudo, status) |

### Mensagens
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/mensagens?consulta_id=...` | Histórico de uma consulta |
| POST | `/api/mensagens` | Cria mensagem manualmente |

### Prompts
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/prompts` | Lista todos os prompts |
| POST | `/api/prompts` | Cria novo prompt |
| PUT | `/api/prompts/:id` | Atualiza prompt |
| DELETE | `/api/prompts/:id` | Remove prompt |

---

## Fluxo Principal

```
1. Paciente faz login com CPF
2. Abre nova consulta
3. Envia foto da lesão + relato textual
4. Backend faz upload da imagem para o MinIO
5. Busca o prompt no banco (critérios ABCDE)
6. Envia imagem + prompt para o modelo de IA escolhido
7. Salva a resposta da IA no histórico da consulta
8. Paciente vê o pré-diagnóstico formatado em Markdown
9. Médico acessa o painel, revisa a análise e emite laudo final
10. Consulta é marcada como "finalizada"
```
