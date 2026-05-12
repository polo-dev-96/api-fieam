# Documentação da API — Captação FIEAM

## Informações Gerais

| Item | Valor |
|---|---|
| **Base URL** | `https://fieam-captacao.ippolo.com.br` |
| **Protocolo** | HTTPS |
| **Formato** | JSON |
| **Autenticação** | Nenhuma (gerenciada internamente pela API) |

> A API realiza login automático na API DCM da FIEAM e renova o token em segundo plano. Nenhuma credencial é exposta nos endpoints.

---

## Endpoints

### 1. Health Check

Verifica se a API está online.

```
GET /health
```

**Resposta de sucesso — `200 OK`**
```json
{
  "success": true,
  "message": "API Alunos SesiSenai online"
}
```

---

### 2. Captação SESI

Retorna todos os registros de captação do **SESI** (coligada 2), percorrendo todas as páginas automaticamente.

```
GET /api/captacao/sesi
```

**Query Params (opcionais)**

| Parâmetro | Tipo | Descrição | Exemplo |
|---|---|---|---|
| `cpf` | string | Filtra pelo CPF exato do aluno | `12345678900` |
| `periodo_letivo` | string | Filtra pelo ano do período letivo | `2025` |

**Exemplos de requisição**

```
GET https://fieam-captacao.ippolo.com.br/api/captacao/sesi
GET https://fieam-captacao.ippolo.com.br/api/captacao/sesi?periodo_letivo=2025
GET https://fieam-captacao.ippolo.com.br/api/captacao/sesi?cpf=12345678900
GET https://fieam-captacao.ippolo.com.br/api/captacao/sesi?cpf=12345678900&periodo_letivo=2025
```

**Resposta de sucesso — `200 OK`**
```json
{
  "success": true,
  "coligada": 2,
  "entidade": "SESI",
  "totalPaginasConsultadas": 12,
  "totalRegistros": 500,
  "data": [
    { ... }
  ]
}
```

---

### 3. Captação SENAI

Retorna todos os registros de captação do **SENAI** (coligada 3), percorrendo todas as páginas automaticamente.

```
GET /api/captacao/senai
```

**Query Params (opcionais)**

| Parâmetro | Tipo | Descrição | Exemplo |
|---|---|---|---|
| `cpf` | string | Filtra pelo CPF exato do aluno | `12345678900` |
| `periodo_letivo` | string | Filtra pelo ano do período letivo | `2025` |

**Exemplos de requisição**

```
GET https://fieam-captacao.ippolo.com.br/api/captacao/senai
GET https://fieam-captacao.ippolo.com.br/api/captacao/senai?periodo_letivo=2025
GET https://fieam-captacao.ippolo.com.br/api/captacao/senai?cpf=12345678900
GET https://fieam-captacao.ippolo.com.br/api/captacao/senai?cpf=12345678900&periodo_letivo=2025
```

**Resposta de sucesso — `200 OK`**
```json
{
  "success": true,
  "coligada": 3,
  "entidade": "SENAI",
  "totalPaginasConsultadas": 55,
  "totalRegistros": 2500,
  "data": [
    { ... }
  ]
}
```

---

### 4. Captação por Coligada

Alternativa genérica aos endpoints `/sesi` e `/senai`. Aceita apenas os valores `2` (SESI) ou `3` (SENAI).

```
GET /api/captacao/:coligada
```

**Parâmetros de rota**

| Parâmetro | Tipo | Valores aceitos |
|---|---|---|
| `coligada` | integer | `2` (SESI) ou `3` (SENAI) |

**Query Params (opcionais)** — mesmos do `/sesi` e `/senai`.

**Exemplos de requisição**

```
GET https://fieam-captacao.ippolo.com.br/api/captacao/2
GET https://fieam-captacao.ippolo.com.br/api/captacao/3
GET https://fieam-captacao.ippolo.com.br/api/captacao/2?periodo_letivo=2025
```

**Resposta de sucesso — `200 OK`**
```json
{
  "success": true,
  "coligada": 2,
  "entidade": "SESI",
  "totalPaginasConsultadas": 12,
  "totalRegistros": 500,
  "data": [ ... ]
}
```

---

## Respostas de Erro

### `400 Bad Request` — Coligada inválida

```json
{
  "success": false,
  "message": "Coligada inválida. Use 2 para SESI ou 3 para SENAI."
}
```

### `404 Not Found` — Rota inexistente

```json
{
  "success": false,
  "message": "Rota não encontrada."
}
```

### `500 Internal Server Error` — Falha na API externa ou erro inesperado

```json
{
  "success": false,
  "message": "Falha ao buscar dados de SESI na página 3: <detalhe do erro>"
}
```

---

## Mapeamento de Entidades

| Coligada | Entidade |
|---|---|
| `2` | SESI |
| `3` | SENAI |

---

## Observações

- **Tempo de resposta**: pode ser lento dependendo do volume de dados, pois a API percorre todas as páginas da API DCM sequencialmente.
- **Filtros aplicados após coleta**: os parâmetros `cpf` e `periodo_letivo` filtram os dados localmente após buscar todas as páginas.
- **Token automático**: o token de autenticação é gerado e renovado automaticamente. Validade configurada para 115 minutos (de um total de 120 minutos da API DCM).
- **Sem paginação na resposta**: todos os registros são retornados em uma única resposta JSON.
