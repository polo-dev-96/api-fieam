# Deploy — api-captacao-fieam

Guia completo para subir a API no servidor de produção em `/opt/webstack/` com Caddy + Docker Compose e atualização via GitHub.

---

## Visão Geral

| Item | Valor |
|---|---|
| Nome do serviço | `api-captacao-fieam` |
| Porta interna (container) | `3007` |
| Domínio | `fieam-captacao.ippolo.com.br` |
| Caminho no servidor | `/opt/webstack/app/api-captacao-fieam/` |

---

## 1. Pré-requisitos

- Acesso SSH ao servidor (`root@177.11.50.137`)
- Repositório criado no GitHub (ex.: `https://github.com/<seu-usuario>/api-captacao-fieam.git`)
- Docker e Docker Compose instalados no servidor
- Caddy rodando via Docker Compose em `/opt/webstack/`

---

## 2. Preparar o Repositório GitHub (local, uma única vez)

Execute localmente antes de enviar:

```bash
# Inicializar o repositório Git (se ainda não foi feito)
git init
git add .
git commit -m "chore: initial commit"

# Criar repositório no GitHub e vincular
git remote add origin https://github.com/<seu-usuario>/api-captacao-fieam.git
git branch -M main
git push -u origin main
```

> O `.gitignore` já ignora `node_modules/` e `.env`. As credenciais nunca vão ao repositório.

---

## 3. Configurar o Servidor (primeira vez)

### 3.1 Clonar o repositório

```bash
mkdir -p /opt/webstack/app/api-captacao-fieam
cd /opt/webstack/app
git clone https://github.com/<seu-usuario>/api-captacao-fieam.git api-captacao-fieam
```

### 3.2 Criar o arquivo `.env` de produção

```bash
cp /opt/webstack/app/api-captacao-fieam/.env.example \
   /opt/webstack/app/api-captacao-fieam/.env

nano /opt/webstack/app/api-captacao-fieam/.env
```

Preencha com os valores reais de produção:

```env
PORT=3007

DCM_BASE_URL=https://apidcm.fieam.com.br
DCM_LOGIN_PATH=/api/Acesso/login
DCM_CAPTACAO_PATH=/api/Captacao

DCM_USERNAME=seu_usuario_producao
DCM_PASSWORD=sua_senha_producao

TOKEN_CACHE_MINUTES=115
REQUEST_TIMEOUT_MS=30000
REQUEST_DELAY_MS=200
MAX_PAGES=500
```

> **Atenção:** O `PORT` deve ser `3007` para não colidir com os serviços existentes.

---

## 4. Adicionar o Serviço ao `docker-compose.yml`

Edite `/opt/webstack/docker-compose.yml`:

```bash
nano /opt/webstack/docker-compose.yml
```

Adicione o bloco abaixo junto aos outros serviços:

```yaml
  api-captacao-fieam:
    build: ./app/api-captacao-fieam
    container_name: api-captacao-fieam
    restart: always
    env_file: ./app/api-captacao-fieam/.env
    ports:
      - "3007:3007"
```

---

## 5. Adicionar a Entrada no `Caddyfile`

Edite `/opt/webstack/Caddyfile`:

```bash
nano /opt/webstack/Caddyfile
```

Adicione ao final do arquivo:

```caddy
fieam-captacao.ippolo.com.br {
  encode gzip
  reverse_proxy host.docker.internal:3007
}
```

---

## 6. Subir o Serviço pela Primeira Vez

```bash
cd /opt/webstack

# Build e start apenas do novo serviço
docker compose up -d --build api-captacao-fieam

# Recarregar o Caddy para aplicar a nova entrada do domínio
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### Verificar se está rodando

```bash
# Logs do container
docker compose logs -f api-captacao-fieam

# Health check direto na porta
curl http://localhost:3007/health
```

Resposta esperada:

```json
{ "success": true, "message": "API Alunos SesiSenai online" }
```

---

## 7. Atualização via GitHub (fluxo contínuo)

Sempre que houver uma nova versão no GitHub, execute no servidor:

```bash
cd /opt/webstack/app/api-captacao-fieam
git pull origin main

cd /opt/webstack
docker compose up -d --build api-captacao-fieam
```

> O `.env` de produção **não é sobrescrito** pelo `git pull` pois está no `.gitignore`.

---

## 8. Comandos Úteis

| Ação | Comando |
|---|---|
| Ver logs em tempo real | `docker compose logs -f api-captacao-fieam` |
| Reiniciar o container | `docker compose restart api-captacao-fieam` |
| Parar o container | `docker compose stop api-captacao-fieam` |
| Remover e recriar | `docker compose up -d --force-recreate api-captacao-fieam` |
| Ver todos os containers | `docker compose ps` |
| Recarregar Caddy | `docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile` |

---

## 9. DNS

Certifique-se de que o domínio `fieam-captacao.ippolo.com.br` possui um registro **A** apontando para `177.11.50.137`. O Caddy cuida automaticamente do certificado HTTPS via Let's Encrypt.
