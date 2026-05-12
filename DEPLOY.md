# Deploy — api-captacao-fieam

Guia completo para subir a API no servidor de produção com Caddy + Docker Compose em `/opt/webstack/` e atualização via GitHub.

---

## Visão Geral

| Item | Valor |
|---|---|
| Nome do serviço | `api-captacao-fieam` |
| Porta interna (container) | `3007` |
| Domínio | `fieam-captacao.ippolo.com.br` |
| Caminho no servidor | `/opt/api-captacao-fieam/api-fieam/` |

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
mkdir -p /opt/api-captacao-fieam
cd /opt/api-captacao-fieam
git clone https://github.com/<seu-usuario>/api-captacao-fieam.git api-fieam
```

### 3.2 Criar o arquivo `.env` de produção

```bash
cp /opt/api-captacao-fieam/api-fieam/.env.example \
   /opt/api-captacao-fieam/api-fieam/.env

nano /opt/api-captacao-fieam/api-fieam/.env
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

## 4. `docker-compose.yml` do Projeto

O projeto tem seu próprio `docker-compose.yml` — **não é necessário alterar o `docker-compose.yml` do webstack**. O Caddy já alcança serviços externos via `host.docker.internal`, que é o padrão de todos os outros apps no servidor.

O arquivo já está no repositório. No servidor ele ficará em `/opt/api-captacao-fieam/api-fieam/docker-compose.yml`.

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
cd /opt/api-captacao-fieam/api-fieam

# Build e start
docker compose up -d --build

# Recarregar o Caddy para aplicar a nova entrada do domínio
cd /opt/webstack
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### Verificar se está rodando

```bash
# Logs do container
cd /opt/api-captacao-fieam/api-fieam
docker compose logs -f

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
cd /opt/api-captacao-fieam/api-fieam
git pull origin main
docker compose up -d --build
```

> O `.env` de produção **não é sobrescrito** pelo `git pull` pois está no `.gitignore`.

---

## 8. Comandos Úteis

| Ação | Comando |
|---|---|
| Ver logs em tempo real | `cd /opt/api-captacao-fieam/api-fieam && docker compose logs -f` |
| Reiniciar o container | `cd /opt/api-captacao-fieam/api-fieam && docker compose restart` |
| Parar o container | `cd /opt/api-captacao-fieam/api-fieam && docker compose stop` |
| Remover e recriar | `cd /opt/api-captacao-fieam/api-fieam && docker compose up -d --force-recreate` |
| Ver todos os containers | `docker ps` |
| Recarregar Caddy | `cd /opt/webstack && docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile` |

---

## 9. DNS

Certifique-se de que o domínio `fieam-captacao.ippolo.com.br` possui um registro **A** apontando para `177.11.50.137`. O Caddy cuida automaticamente do certificado HTTPS via Let's Encrypt.
