# K9 Training Platform

K9 Training e uma plataforma digital brasileira que conecta donos de caes e adestradores profissionais.

O produto combina:

- cadastro e acompanhamento de caes
- agenda e treinos
- conteudo em video e texto
- blog, forum e canais
- planos de assinatura
- dashboards por perfil

## Documentacao do produto

- Blueprint de produto: [docs/product-blueprint.md](docs/product-blueprint.md)
- Roadmap atual: [TODO.md](TODO.md)

## Stack atual

- Next.js App Router
- React 19
- Prisma
- PostgreSQL
- NextAuth
- Asaas
- Stripe (legado / fallback)
- Resend / SMTP

## Perfis

- Cliente
- Adestrador
- Admin

## Regras de plano

- Free: ate 3 caes, blog e area de racas
- Standard: R$ 29,90/mes com acesso completo a conteudos, forum, treinos, agenda, IA e canais

## Rodando localmente

```bash
cp .env.example .env.local
docker compose up -d db
npm run dev
```

Abra `http://localhost:3000`.

Se voce rodar o app fora do Docker, use `DATABASE_URL` apontando para `localhost:5432`.
O hostname `db` funciona apenas quando a aplicacao esta dentro da rede do `docker compose`.

## Deploy

Antes de subir para producao:

```bash
cp .env.production.example .env.production
npx prisma generate
npm run db:migrate:deploy
npx tsc --noEmit
npm run build
```

Fluxo com Docker:

```bash
docker build -t k9trainingplatform .
docker run --rm --env-file .env.production k9trainingplatform npm run db:migrate:deploy
docker run -d --env-file .env.production -p 3000:3000 --name k9trainingplatform k9trainingplatform
```

Se o banco de destino ja existir com schema criado manualmente e sem historico do Prisma, faca o baseline uma vez antes do `migrate deploy`:

```bash
npx prisma migrate resolve --applied 20260330061000_init --schema=prisma/schema.prisma
```

Checklist minimo:

- banco Postgres gerenciado com backup automatico
- `NEXTAUTH_URL` com o dominio real em `https`
- `NEXTAUTH_SECRET` e `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` fortes
- Asaas configurado com webhook real em `/api/webhooks/asaas`
- email transacional real via SMTP ou Resend
- storage persistente para uploads
- monitoramento de logs, falhas de pagamento e webhooks

## Onde colocar APIs externas

Local:

- use `.env.local`

Producao:

- configure tudo no painel de variaveis do provedor de deploy
- exemplos: Vercel Project Settings, Railway Variables, Docker secrets, Coolify Environment
- nunca exponha segredos no frontend nem em `NEXT_PUBLIC_*`
- use `.env.production.example` como checklist do deploy

Variaveis por grupo:

- Banco: `DATABASE_URL`
- Auth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `AUTH_TRUST_HOST`, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
- Pagamento Asaas: `PAYMENT_PROVIDER`, `ASAAS_SANDBOX`, `ASAAS_API_BASE_URL`, `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`
- Stripe legado: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID_STANDARD`, `STRIPE_SUCCESS_URL`, `STRIPE_CANCEL_URL`, `STRIPE_WEBHOOK_SECRET`
- Email SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM_NAME`, `EMAIL_FROM_ADDRESS`, `EMAIL_REPLY_TO`
- Email Resend: `RESEND_API_KEY`
- IA: `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BREED_MODEL`
- Dados externos: `THEDOGAPI_API_KEY`
- Cache/rate limit persistente: `REDIS_URL`

Obrigatorio para subir:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
- `AUTH_TRUST_HOST`
- `ALLOWED_ORIGINS`
- `ADMIN_API_KEY`
- `ROOT_ADMIN_KEY`
- `PAYMENT_PROVIDER`
- `ASAAS_API_KEY`
- `ASAAS_WEBHOOK_TOKEN`
- `ASAAS_API_BASE_URL`
- um provedor de email: `SMTP_*` ou `RESEND_API_KEY`
- `EMAIL_FROM_NAME`
- `EMAIL_FROM_ADDRESS`

Opcional no primeiro deploy:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_BREED_MODEL`
- `THEDOGAPI_API_KEY`
- `DOG_API_KEY`
- `REDIS_URL`
- `STRIPE_*`

## Build de producao

```bash
npm run build
npm run start
```

## Pontos de infraestrutura para producao

- email transacional real
- checkout e webhook reais
- storage persistente para uploads
- revisao final de seguranca e observabilidade

## Observacao

O build passa, mas o repositório ainda possui uma divida tecnica relevante em lint e tipagem. A etapa de hardening para lancamento amplo ainda precisa ser concluida.
