BackEnd/
├── .env → variáveis sensíveis
├── package.json
└── src/
    ├── config/         # Inicialização do Supabase/Firebase
    ├── controllers/    # Lida com as requisições HTTP
    ├── middlewares/    # Autenticação, validação de arquivos (Multer, etc.)
    ├── models/         # Esquemas de dados (usuários, laudos, histórico)
    ├── providers/      # Integrações externas
    │   ├── ai/         # gemini.js, openai.js, claude.js, deepseek.js
    │   └── storage/    # upload para bucket do Supabase/Firebase
    ├── queues/         # Filas para processamento assíncrono
    ├── routes/         # Definição das rotas da API
    └── services/       # Regra de negócio (orquestra banco + providers)