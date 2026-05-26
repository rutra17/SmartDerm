# Storage

Responsável pelo upload e remoção de imagens de lesões de pele.

O provider atual é o **MinIO**, que roda como um container Docker junto com o restante da aplicação.

---

## Arquivos

| Arquivo | Descrição |
|---|---|
| `index.js` | Ponto de entrada — expõe `uploadImagem` e `removerImagem` |
| `minio.js` | Implementação do provider MinIO |

---

## Como funciona

Toda a comunicação com o storage passa pelo `index.js`:

```js
import { uploadImagem, removerImagem } from './storage/index.js';

// Fazer upload
const { url, caminho, erro } = await uploadImagem(buffer, 'foto.jpg', 'image/jpeg');

// Remover
const { sucesso, erro } = await removerImagem(caminho);
```

O `minio.js` cria o bucket automaticamente na primeira vez que é chamado, então nenhuma configuração manual é necessária.

---

## Variáveis de ambiente

Definidas no `.env` na raiz do projeto:

| Variável | Padrão | Descrição |
|---|---|---|
| `MINIO_ENDPOINT` | `minio` | Nome do container no Docker Compose |
| `MINIO_PORT` | `9000` | Porta da API |
| `MINIO_ACCESS_KEY` | `minioadmin` | Usuário de acesso |
| `MINIO_SECRET_KEY` | `minioadmin` | Senha de acesso |
| `MINIO_BUCKET` | `smartderm-imagens` | Nome do bucket |

---

## Console web

Com o Docker Compose rodando, acesse o painel do MinIO em:

```
http://localhost:9001
```

Use as credenciais definidas em `MINIO_ACCESS_KEY` e `MINIO_SECRET_KEY`.
