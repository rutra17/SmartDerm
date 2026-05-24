# AI Providers

Responsável por enviar imagens de lesões de pele para análise e retornar um laudo estruturado.

Cada provider se comunica com uma API de IA diferente, mas todos recebem os mesmos parâmetros e retornam o mesmo formato de resposta.

---

## Arquivos

| Arquivo | Provider | Modelo padrão |
|---|---|---|
| `gemini.js` | Google Gemini | `gemini-1.5-flash` |
| `openai.js` | OpenAI | `gpt-4o` |
| `claude.js` | Anthropic Claude | `claude-sonnet-4-6` |
| `deepseek.js` | DeepSeek | `deepseek-chat` |
| `prompt.js` | — | Prompt compartilhado por todos |
| `index.js` | — | Ponto de entrada e exportações |

---

## Como usar

```js
import { analisarComGemini } from './ai/index.js';

const resultado = await analisarComGemini(imageBuffer, 'image/jpeg');
```

Todas as funções seguem a mesma assinatura:

```js
analisarCom<Provider>(imagemBuffer, mimeType, config)
```

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `imagemBuffer` | `Buffer` | Imagem em memória |
| `mimeType` | `string` | Ex: `image/jpeg`, `image/png` |
| `config` | `object` | Opcional — sobrescreve modelo e temperatura |

---

## Resposta

Todos os providers retornam o mesmo formato (`createAIResult`):

```json
{
  "provider": "gemini",
  "modelo": "gemini-1.5-flash",
  "diagnostico": "Lesão pigmentada com bordas irregulares...",
  "classificacao": {
    "tipo": "melanoma",
    "confianca": 0.87
  },
  "metricas": {
    "latenciaMs": 1240,
    "tokensEntrada": 320,
    "tokensSaida": 180,
    "custoEstimadoUSD": 0.000048
  },
  "erro": null
}
```

Se ocorrer um erro na chamada, `erro` conterá a mensagem e os demais campos de diagnóstico virão `null`.

---

## Variáveis de ambiente

Cada provider precisa da sua chave de API no `.env`:

| Variável | Provider |
|---|---|
| `GEMINI_API_KEY` | Google Gemini |
| `OPENAI_API_KEY` | OpenAI |
| `ANTHROPIC_API_KEY` | Claude |
| `DEEPSEEK_API_KEY` | DeepSeek |

O provider padrão é definido pela variável `AI_PROVIDER` (padrão: `gemini`).  
Também pode ser escolhido por requisição via query string: `POST /api/upload?provider=claude`
