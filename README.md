# API Alunos SesiSenai

API Node.js que consome a API externa da FIEAM/DCM e retorna todos os dados de **Captação** do SESI e SENAI em uma única resposta, percorrendo automaticamente todas as páginas disponíveis.

---

## Objetivo

A API externa da DCM retorna os dados paginados. Esta API interna:

- Faz login automático e armazena o token em cache.
- Renova o token antes de expirar (após 115 minutos de uma validade de 120 minutos).
- Percorre todas as páginas da API externa até não haver mais registros.
- Retorna todos os dados consolidados em uma única resposta JSON.

---

## Instalação

```bash
npm install
```

---

## Configuração

Copie o arquivo `.env.example` para `.env` e preencha as credenciais:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
PORT=3000

DCM_BASE_URL=https://apidcm.fieam.com.br
DCM_LOGIN_PATH=/api/Acesso/login
DCM_CAPTACAO_PATH=/api/Captacao

DCM_USERNAME=seu_usuario
DCM_PASSWORD=sua_senha

TOKEN_CACHE_MINUTES=115
REQUEST_TIMEOUT_MS=30000
REQUEST_DELAY_MS=200
MAX_PAGES=500
```

> **Atenção:** Nunca commite o arquivo `.env` com credenciais reais. O `.gitignore` já está configurado para ignorá-lo.

---

## Como rodar

### Desenvolvimento (com hot reload)

```bash
npm run dev
```

### Produção

```bash
npm start
```

---

## Endpoints

### Health Check

```
GET http://localhost:3000/health
```

Resposta:
```json
{
  "success": true,
  "message": "API Alunos SesiSenai online"
}
```

---

### Query Params (opcionais)

Todos os endpoints de captação aceitam filtros via query string:

| Parâmetro       | Tipo   | Descrição                                    | Exemplo     |
|-----------------|--------|----------------------------------------------|-------------|
| `cpf`           | string | Filtra pelo campo `CPF` (match exato)        | `12345678900` |
| `periodo_letivo`| string | Filtra pelo ano do campo `PERIODO_LETIVO`    | `2025`      |

Exemplo com filtros:

```
GET http://localhost:3000/api/captacao/sesi?cpf=12345678900&periodo_letivo=2025
```

---

### Captação SESI

```
GET http://localhost:3000/api/captacao/sesi
```

Resposta:
```json
{
  "success": true,
  "coligada": 2,
  "entidade": "SESI",
  "totalPaginasConsultadas": 12,
  "totalRegistros": 500,
  "data": []
}
```

---

### Captação SENAI

```
GET http://localhost:3000/api/captacao/senai
```

Resposta:
```json
{
  "success": true,
  "coligada": 3,
  "entidade": "SENAI",
  "totalPaginasConsultadas": 55,
  "totalRegistros": 2500,
  "data": []
}
```

---

### Captação por coligada (genérico)

```
GET http://localhost:3000/api/captacao/2
GET http://localhost:3000/api/captacao/3
```

Apenas os valores `2` (SESI) e `3` (SENAI) são aceitos. Qualquer outro valor retorna erro 400.

---

## Mapeamento de entidades

| Coligada | Entidade |
|----------|----------|
| 2        | SESI     |
| 3        | SENAI    |

---

## Autenticação

- O token Bearer é gerado automaticamente no primeiro request.
- Fica armazenado em memória (sem banco de dados, sem arquivo).
- É reutilizado enquanto estiver dentro do prazo configurado em `TOKEN_CACHE_MINUTES`.
- Quando expirado ou próximo de vencer, um novo login é feito automaticamente.
- Se a API externa retornar 401 ou 403, o token é descartado e um novo login é realizado antes de tentar novamente.

---

## Requisitos

- Node.js >= 18
