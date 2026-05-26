BackEnd/
├── .env → variáveis sensíveis
├── package.json
└── src/                                                                                <-- Artur pode ajudar em quem tiver BO daqui de back
    ├── config/         # Inicialização do Supabase/Firebase                            <-- Gabriel
    ├── controllers/    # Lida com as requisições HTTP                                  <-- Gabriel
    ├── middlewares/    # Autenticação, validação de arquivos (Multer, etc.)            <-- Gabriel
    ├── models/         # Esquemas de dados (usuários, laudos, histórico)               <-- Ju
    ├── providers/      # Integrações externas                                          <-- Ju
    │   ├── ai/         # gemini.js, openai.js, claude.js, deepseek.js                  <-- Ju
    │   └── storage/    # upload para bucket do Supabase/Firebase                       <-- Ju
    ├── queues/         # Filas para processamento assíncrono                           <-- Henrique
    ├── routes/         # Definição das rotas da API                                    <-- Henrique
    └── services/       # Regra de negócio (orquestra banco + providers)                <-- Henrique
