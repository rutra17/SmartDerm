import swaggerUi from 'swagger-ui-express';

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'SmartDerm AI API',
    version: '1.1.0',
    description: 'Documentação oficial e completa da API do SmartDerm. Inclui autenticação, sessões, auditoria, IA generativa e sistema de gestão hospitalar.',
  },
  servers: [
    {
      url: 'https://api.smartderm.37.27.81.229.sslip.io',
      description: 'Servidor de Produção',
    },
    {
      url: 'http://localhost:3000',
      description: 'Servidor Local (Desenvolvimento)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT gerado no login (sem a palavra "Bearer ").',
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Autenticação, registo e gestão de sessões (Login/Logout)' },
    { name: 'Admin', description: 'Painel do SysAdmin (Acesso Absoluto e Convites)' },
    { name: 'Chat & Consultas', description: 'Sistema de triagem de pacientes e comunicação com a IA' },
    { name: 'Médico', description: 'Painel do Médico, filas de triagem e emissão de laudos' },
    { name: 'Cientista', description: 'Dashboard científico, engenharia de prompts e auditoria' }
  ],
  paths: {
    // ==========================================
    // 1. ROTAS DE AUTENTICAÇÃO (Auth)
    // ==========================================
    '/api/auth/login': {
      post: { 
        tags: ['Auth'], summary: 'Realiza login no sistema', 
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string', example: 'admin_bruno' }, senha: { type: 'string', example: '123456' } } } } } }, 
        responses: { 200: { description: 'Login bem sucedido com Token JWT' }, 401: { description: 'Senha incorreta' }, 404: { description: 'Utilizador não encontrado' } } 
      }
    },
    '/api/auth/registrar': {
      post: { 
        tags: ['Auth'], summary: 'Regista um novo utilizador no sistema', 
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, senha: { type: 'string' }, nome: { type: 'string' }, email: { type: 'string' }, tipo: { type: 'string', enum: ['paciente', 'medico', 'cientista'] }, dadoEspecifico: { type: 'string', description: 'CPF, CRM ou Instituição' }, genero: { type: 'string' }, cep: { type: 'string' }, endereco: { type: 'string' }, referencia: { type: 'string' } } } } } }, 
        responses: { 201: { description: 'Utilizador criado' }, 400: { description: 'Utilizador já registado' } } 
      }
    },
    '/api/auth/registrar-convite': {
      post: { 
        tags: ['Auth'], summary: 'Regista um paciente rapidamente via Link de Convite', 
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string', description: 'Token do convite gerado pelo Admin' }, nome: { type: 'string' }, medicoId: { type: 'string', description: '(Opcional) ID do médico' } } } } } }, 
        responses: { 201: { description: 'Paciente criado via convite' }, 400: { description: 'Convite inválido ou expirado' } } 
      }
    },
    '/api/auth/logout': {
      post: { 
        tags: ['Auth'], summary: 'Encerra a sessão do utilizador (Rastreio Online/Offline)', security: [{ bearerAuth: [] }], 
        responses: { 200: { description: 'Sessão encerrada' } } 
      }
    },

    // ==========================================
    // 2. ROTAS DO ADMIN (SysAdmin)
    // ==========================================
    '/api/admin/resumo': {
      get: { tags: ['Admin'], summary: 'Obtém estatísticas gerais do sistema (Totais)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Sucesso' } } }
    },
    '/api/admin/listar-tudo': {
      get: { tags: ['Admin'], summary: 'Lista todos os pacientes, médicos, cientistas e consultas', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Sucesso' } } }
    },
    '/api/admin/criar-usuario': {
      post: { 
        tags: ['Admin'], summary: 'Criação direta de contas (Médicos ou Cientistas)', security: [{ bearerAuth: [] }], 
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { tipo: { type: 'string', enum: ['medico', 'cientista'] }, username: { type: 'string' }, senha: { type: 'string' }, nome: { type: 'string' }, email: { type: 'string' }, extra: { type: 'string', description: 'CRM ou Instituição' } } } } } }, 
        responses: { 201: { description: 'Utilizador criado com sucesso' } } 
      }
    },
    '/api/admin/deletar/{tipo}/{id}': {
      delete: { 
        tags: ['Admin'], summary: 'Apaga permanentemente qualquer entidade', security: [{ bearerAuth: [] }], 
        parameters: [
          { name: 'tipo', in: 'path', required: true, schema: { type: 'string', enum: ['paciente', 'medico', 'cientista', 'consulta'] } },
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }
        ],
        responses: { 200: { description: 'Entidade apagada' } } 
      }
    },
    '/api/admin/gerar-convite': {
      post: { tags: ['Admin'], summary: 'Gera um link de convite válido por 24h para pacientes', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Link gerado com sucesso' } } }
    },

    // ==========================================
    // 3. ROTAS DO PACIENTE (Chat & Consultas)
    // ==========================================
    '/api/medicos': {
      get: { tags: ['Chat & Consultas'], summary: 'Lista todos os médicos disponíveis para triagem', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Sucesso' } } }
    },
    '/api/prompts': {
      get: { tags: ['Chat & Consultas'], summary: 'Lista os prompts ativos no sistema', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Sucesso' } } }
    },
    '/api/consultas': {
      get: { tags: ['Chat & Consultas'], summary: 'Lista o histórico de consultas do paciente logado', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Sucesso' } } },
      post: { 
        tags: ['Chat & Consultas'], summary: 'Inicia uma nova triagem/consulta', security: [{ bearerAuth: [] }], 
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { nome_paciente: { type: 'string', description: 'Queixa/Título da consulta' }, medicoId: { type: 'string', format: 'uuid', nullable: true } } } } } }, 
        responses: { 201: { description: 'Consulta criada' } } 
      }
    },
    '/api/consultas/{id}/mensagens': {
      get: { 
        tags: ['Chat & Consultas'], summary: 'Carrega o histórico de mensagens de uma consulta específica', security: [{ bearerAuth: [] }], 
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Sucesso' } } 
      }
    },
    '/api/chat/enviar': {
      post: { 
        tags: ['Chat & Consultas'], summary: 'Envia texto e/ou foto da lesão para análise da IA (Gemini)', security: [{ bearerAuth: [] }],
        requestBody: { 
          required: true, 
          content: { 
            'multipart/form-data': { 
              schema: { type: 'object', properties: { 
                imagem: { type: 'string', format: 'binary', description: 'Foto da pele' }, 
                texto: { type: 'string', description: 'Sintomas relatados pelo paciente' },
                consultaId: { type: 'string', format: 'uuid' },
                ia_utilizada: { type: 'string', example: 'gemini' },
                prompt_utilizado: { type: 'string', example: 'padrao' }
              }} 
            } 
          } 
        },
        responses: { 200: { description: 'Resposta da IA processada e devolvida' } } 
      }
    },

    // ==========================================
    // 4. ROTAS DO MÉDICO (Painel Clínico)
    // ==========================================
    '/api/medico/consultas': {
      get: { tags: ['Médico'], summary: 'Lista a fila de pacientes pendentes ou finalizados para o médico', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Sucesso' } } }
    },
    '/api/medico/consultas/{id}': {
      get: { 
        tags: ['Médico'], summary: 'Detalhes completos de uma triagem (fotos, pré-laudo da IA, histórico)', security: [{ bearerAuth: [] }], 
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Sucesso' } } 
      }
    },
    '/api/medico/consultas/{id}/laudo': {
      post: { 
        tags: ['Médico'], summary: 'Salva o parecer final do médico e marca a consulta como Finalizada', security: [{ bearerAuth: [] }], 
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { laudoMedico: { type: 'string' } } } } } },
        responses: { 200: { description: 'Laudo salvo com sucesso' } } 
      }
    },

    // ==========================================
    // 5. ROTAS DO CIENTISTA (Laboratório de IA)
    // ==========================================
    '/api/cientista/estatisticas': {
      get: { tags: ['Cientista'], summary: 'Obtém estatísticas avançadas (consumo de tokens, latência, custos)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Sucesso' } } }
    },
    '/api/cientista/auditoria': {
      get: { tags: ['Cientista'], summary: 'Acessa dados de validação cruzada (Queixa vs IA vs Laudo Médico)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Sucesso' } } }
    },
    '/api/cientista/prompts': {
      get: { tags: ['Cientista'], summary: 'Lista todos os templates de Engenharia de Prompts', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Sucesso' } } },
      post: { 
        tags: ['Cientista'], summary: 'Cria um novo template de instrução para a IA', security: [{ bearerAuth: [] }], 
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { titulo: { type: 'string' }, chave: { type: 'string' }, instrucao: { type: 'string' } } } } } },
        responses: { 201: { description: 'Prompt criado' } } 
      }
    },
    '/api/cientista/prompts/{id}': {
      put: { 
        tags: ['Cientista'], summary: 'Atualiza a instrução de um Prompt', security: [{ bearerAuth: [] }], 
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { titulo: { type: 'string' }, chave: { type: 'string' }, instrucao: { type: 'string' } } } } } },
        responses: { 200: { description: 'Prompt atualizado' } } 
      },
      delete: { 
        tags: ['Cientista'], summary: 'Apaga um Prompt do sistema', security: [{ bearerAuth: [] }], 
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Prompt deletado' } } 
      }
    }
  }
};

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};