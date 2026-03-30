# VPS Docker Deploy

Base considerada: Docker standalone em VPS Linux com o app self-hosted em Next.js.

## Leitura curta

- Use o arquivo `compose.production.yaml` para produção.
- Use `.env.production` para os segredos.
- Rode migração antes de subir o app.
- Hoje uploads ainda ficam em disco local; o `compose.production.yaml` já monta volume persistente, mas o ideal futuro continua sendo S3.

## 1. Preparar a VPS

Ubuntu/Debian:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

## 2. Baixar o projeto

```bash
git clone <SEU_REPOSITORIO_GIT> k9-training-platform
cd k9-training-platform
```

## 3. Criar o arquivo de ambiente

```bash
cp .env.production.example .env.production
nano .env.production
```

Preencha no minimo:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
- `ALLOWED_ORIGINS`
- `ADMIN_API_KEY`
- `ROOT_ADMIN_KEY`
- `ASAAS_API_KEY`
- `ASAAS_WEBHOOK_TOKEN`
- `ASAAS_API_BASE_URL`
- `EMAIL_FROM_NAME`
- `EMAIL_FROM_ADDRESS`
- SMTP completo ou `RESEND_API_KEY`

## 4. Subir a aplicacao

Build da imagem:

```bash
docker compose -f compose.production.yaml build
```

Aplicar migrações:

```bash
docker compose -f compose.production.yaml run --rm app npm run db:migrate:deploy
```

Subir em background:

```bash
docker compose -f compose.production.yaml up -d
```

Ver logs:

```bash
docker compose -f compose.production.yaml logs -f app
```

## 5. Validar

Ver containers:

```bash
docker compose -f compose.production.yaml ps
```

Testar a aplicação localmente na VPS:

```bash
curl -I http://127.0.0.1:3000/login
```

Se a porta `3000` estiver exposta, teste de fora:

```bash
curl -I http://SEU_IP:3000/login
```

## 6. Configurar pagamento Asaas

No painel do Asaas:

1. Gere a `ASAAS_API_KEY`.
2. Cadastre o webhook da plataforma.
3. Defina o mesmo token do webhook em `ASAAS_WEBHOOK_TOKEN`.

URL do webhook:

```text
https://SEU_DOMINIO/api/webhooks/asaas
```

O backend valida o header `asaas-access-token`, então o token do painel precisa bater com o valor do `.env.production`.

## 7. Configurar email

Opção SMTP:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM_ADDRESS`

Opção Resend:

- deixe SMTP vazio
- preencha `RESEND_API_KEY`
- valide o domínio remetente no painel da Resend

## 8. Atualizar o app depois

```bash
git pull
docker compose -f compose.production.yaml build
docker compose -f compose.production.yaml run --rm app npm run db:migrate:deploy
docker compose -f compose.production.yaml up -d
```

## 9. Rollback simples

Se o deploy quebrar logo após uma troca recente e você tiver o commit anterior:

```bash
git log --oneline -n 5
git checkout <COMMIT_ANTERIOR>
docker compose -f compose.production.yaml build
docker compose -f compose.production.yaml run --rm app npm run db:migrate:deploy
docker compose -f compose.production.yaml up -d
```

Depois disso, valide `docker compose -f compose.production.yaml logs -f app`.

## 10. Recomendado antes de abrir ao publico

- apontar domínio real para a VPS
- colocar HTTPS na frente com Nginx, Caddy ou proxy gerenciado
- limitar acesso direto à porta `3000`
- manter backup do banco
- monitorar logs do app e falhas de webhook
- planejar migração de uploads para S3
