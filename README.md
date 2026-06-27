# SmartDerm AI

Sistema de triagem dermatológica assistida por inteligência artificial. Pacientes enviam fotos de lesões de pele, a IA gera um pré-diagnóstico estruturado com base nos critérios ABCDE, e médicos revisam e emitem o laudo final.

---

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Banco de dados:** PostgreSQL 16
- **Armazenamento de imagens:** MinIO
- **Autenticação:** JWT
- **IA:** Gemini - Futuramente Claude, OpenAI, DeepSeek
- **Infraestrutura:** Docker + Docker Compose

---

## Como executar

### Pré-requisitos

- Docker e Docker Compose instalados
- Chaves de API dos modelos de IA 

### 1. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as chaves necessárias:

```env
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
DEEPSEEK_API_KEY=

CODIGO_MEDICO=
CODIGO_CIENTISTA=
JWT_SECRET=
```

### 2. Subir a aplicação

```bash
docker compose up --build
```

### 3. Acessar

| Serviço | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |

### Parar

```bash
docker compose down
```

---

## Papéis de usuário

| Papel | Acesso |
|---|---|
| Paciente | Login com CPF — envia imagens e acompanha triagens |
| Médico | Login com CRM — revisa análises da IA e emite laudos |
| Cientista de Dados | Login com username — gerencia prompts e monitora estatísticas |
| Admin | Login com username - Controla as entradas e saídas dos usuários e gerencia os convites |

O cadastro de médico e cientista requer um código de autorização fornecido pelo administrador do sistema.
