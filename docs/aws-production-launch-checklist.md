# AWS Production Launch Checklist

Data da revisão: 2026-03-26
Base considerada: estado atual do código em `/home/italo/Documentos/k9-training-platform`

## Leitura curta
- A plataforma já tem base boa para lançamento: autenticação, sessão com plano, área administrativa, fluxo de email, catálogo de raças, IA e build local validado.
- Hoje ela ainda não está em nível de produção real sem uma rodada final de infra e segurança.
- Os bloqueios mais importantes não são “mais tela”; são persistência, migração de banco, segredos, storage de mídia e operação.

## O que ainda falta antes de pagar AWS e lançar

### 1. Banco com migrações reais
- O repositório agora já possui baseline em `prisma/migrations/20260330061000_init/`.
- O `Dockerfile` nao sobe mais a aplicação executando `db push` no boot.
- Para lançamento, o fluxo recomendado passa a ser `prisma migrate deploy` em etapa separada do start do container.

Arquivos afetados:
- `prisma/schema.prisma`
- `Dockerfile`

Referência oficial:
- Prisma recomenda aplicar mudanças em produção com `prisma migrate deploy`: https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate

### 2. Uploads precisam sair do disco local
- Hoje imagens e vídeos ainda são gravados em `public/uploads/...`.
- Em ECS/Fargate ou qualquer ambiente com containers recicláveis, isso não é persistente.
- Para produção, mídia deve ir para storage externo, preferencialmente S3 com URL assinada ou fluxo equivalente.

Arquivos afetados:
- `src/app/api/upload/image/route.ts`
- `src/app/api/upload/video/route.ts`

Referência oficial:
- Amazon S3 e presigned URLs: https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html

### 3. Segredos não podem viver em arquivo de exemplo com valor real
- O `.env.example` tinha chaves reais ou muito próximas de reais; isso já foi limpo nesta rodada.
- Para produção, os segredos precisam ir para Secrets Manager ou outro cofre de segredos confiável.

Arquivo afetado:
- `.env.example`

Referência oficial:
- AWS Secrets Manager: https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html

### 4. Falta desenho final de operação
- O `compose.yaml` é útil para desenvolvimento, não para lançamento.
- Em AWS, o caminho mais coerente para o estado atual do projeto é `ECR + ECS Fargate + ALB + RDS PostgreSQL + S3 + Secrets Manager + CloudWatch`.
- O app é Next.js self-hosted com Docker, então precisa de imagem única por release e de consistência entre réplicas.

Arquivos que mostram o cenário atual:
- `Dockerfile`
- `compose.yaml`
- `next.config.js`

Referências oficiais:
- Next.js self-hosting: https://nextjs.org/docs/app/guides/self-hosting
- Amazon ECS: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html

### 5. Backup, monitoramento e alarmes ainda são bloco pendente
- O projeto já tem documentação interna apontando isso como pendente.
- Antes do lançamento, você precisa definir:
  - retenção e restore do banco
  - logs centralizados
  - alarmes de erro e indisponibilidade
  - política de rollback

Arquivos de apoio:
- `docs/platform-readiness-audit.md`

Referências oficiais:
- Amazon RDS backups: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_CommonTasks.BackupRestore.html
- Amazon ECS com CloudWatch e serviços relacionados: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html

## Minha recomendação de stack na AWS

### Camada web
- Suba a imagem da aplicação no Amazon ECR.
- Rode a aplicação em Amazon ECS com AWS Fargate.
- Use um Application Load Balancer na frente.

### Banco
- Use Amazon RDS PostgreSQL.
- Se o orçamento permitir, comece com Multi-AZ já pensando em disponibilidade.
- Se o orçamento estiver apertado, dá para iniciar simples, mas já com backup automático e plano de restore testado.

### Arquivos
- Mova imagem e vídeo para Amazon S3.
- O app deve salvar apenas a URL e metadados no banco.

### Segredos
- Use AWS Secrets Manager para `DATABASE_URL`, `NEXTAUTH_SECRET`, chaves do gateway de pagamento (Asaas/Stripe), SMTP/Resend, OpenAI e Dog API.

### Observabilidade
- Logs da aplicação no CloudWatch Logs.
- Alarmes para `5xx`, falha de health check, CPU/memória alta e erro de conexão com banco.

## Ordem prática para lançar sem se perder

1. Fechar migrações Prisma e tirar `db push` do boot de produção.
2. Migrar uploads locais para S3.
3. Subir segredos para Secrets Manager.
4. Provisionar RDS PostgreSQL e validar backup/restore.
5. Publicar imagem no ECR e subir serviço no ECS Fargate.
6. Configurar domínio, HTTPS e variáveis finais.
7. Fazer smoke test completo: login, cadastro, verificação de email, assinatura, post, upload e área admin.
8. Lançar com monitoramento e alarme já ligados.

## Status honesto de prontidão
- `pronto para continuação de produto`: sim
- `pronto para ambiente de staging na AWS`: sim, com poucas travas
- `pronto para produção pública agora`: ainda não

Os principais bloqueios para produção pública hoje são:
- migrações ausentes
- uploads locais
- operação sem stack AWS fechada
- observabilidade e recuperação ainda sem fechamento final
