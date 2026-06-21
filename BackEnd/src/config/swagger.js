import swaggerUi from 'swagger-ui-express';

export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'SmartDerm AI API',
    version: '1.0.0',
    description: 'Documentação oficial da API do SmartDerm. Inclui rotas de pacientes, médicos, cientistas e administração.',
  },
  servers: [
    {
      url: 'https://api.smartderm.37.27.81.229.sslip.io',
      description: 'Servidor de Produção',
    },
    {
      url: 'http://localhost:3001',
      description: 'Servidor Local (Desenvolvimento)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT retornado no login.',
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Rotas de autenticação' },
    { name: 'Admin', description: 'Painel do Administrador' },
    { name: 'Chat & Consultas', description: 'Interação de IA e listagem de médicos' },
    { name: 'Médico', description: 'Painel do Médico e Laudos' },
    { name: 'Cientista', description: 'Painel do Cientista e Prompts' },
    { name: 'Upload', description: 'Upload de Imagens' }
  ],
  paths: {
    '/api/auth/login': {
      post: { tags: ['Auth'], summary: 'Realiza login no sistema', requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, senha: { type: 'string' } } } } } }, responses: { 200: { description: 'Login bem sucedido' } } }
    },
    '/api/auth/registrar': {
      post: { tags: ['Auth'], summary: 'Registra um novo usuário', responses: { 201: { description: 'Usuário criado' } } }
    },
    '/api/admin/setup': {
      post: { tags: ['Admin'], summary: 'Cria o admin mestre', responses: { 200: { description: 'Admin configurado' } } }
    },
    '/api/admin/resumo': {
      get: { tags: ['Admin'], summary: 'Obtém resumo geral', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Sucesso' } } }
    },
    '/api/admin/listar-tudo': {
      get: { tags: ['Admin'], summary: 'Lista todas as entidades', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Sucesso' } } }
    },
    '/api/consultas': {
      get: { tags: ['Chat & Consultas'], summary: 'Lista consultas do usuário', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Sucesso' } } },
      post: { tags: ['Chat & Consultas'], summary: 'Cria uma nova consulta', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Consulta criada' } } }
    },
    '/api/chat/enviar': {
      post: { 
        tags: ['Chat & Consultas'], summary: 'Envia mensagem com imagem para a IA', security: [{ bearerAuth: [] }],
        requestBody: { content: { 'multipart/form-data': { schema: { type: 'object', properties: { imagem: { type: 'string', format: 'binary' }, mensagem: { type: 'string' } } } } } },
        responses: { 200: { description: 'Resposta da IA' } } 
      }
    },
    '/api/medico/consultas': {
      get: { tags: ['Médico'], summary: 'Lista fila de consultas para o médico', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Sucesso' } } }
    },
    '/api/medico/consultas/{id}/laudo': {
      post: { 
        tags: ['Médico'], summary: 'Salva o laudo de uma consulta', security: [{ bearerAuth: [] }], 
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Laudo salvo' } } 
      }
    },
    '/api/cientista/estatisticas': {
      get: { tags: ['Cientista'], summary: 'Obtém estatísticas de IA', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Sucesso' } } }
    },
    '/api/cientista/prompts': {
      get: { tags: ['Cientista'], summary: 'Lista prompts do sistema', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Sucesso' } } },
      post: { tags: ['Cientista'], summary: 'Cria novo prompt', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Sucesso' } } }
    },
    '/api/upload': {
      post: { 
        tags: ['Upload'], summary: 'Faz upload de uma imagem via Multer',
        requestBody: { content: { 'multipart/form-data': { schema: { type: 'object', properties: { imagem: { type: 'string', format: 'binary' } } } } } },
        responses: { 200: { description: 'URL da imagem gerada' } } 
      }
    }
  }
};

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};