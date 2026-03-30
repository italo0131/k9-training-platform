# Roadmap Asaas e Lancamento Seguro

## O que ja ficou alinhado na aplicacao

- A sessao agora pode ser lida de forma consistente por `role`, `status`, `plan` e `planStatus`.
- Areas premium passam a respeitar `planStatus` no middleware principal.
- Profissionais aprovados podem ser tratados como lado operacional da plataforma, sem depender da mesma regra do tutor Standard.
- Canais pagos nao podem mais ser liberados de forma falsa sem cobranca real.
- Billing e financeiro ficaram menos acoplados ao Stripe na interface.

## O que falta para monetizacao real com Asaas

1. Assinatura do tutor:
   - Criar cliente no Asaas.
   - Criar assinatura recorrente do Standard.
   - Salvar referencia externa da assinatura no banco.
   - Atualizar `plan` e `planStatus` por webhook.

2. Canais pagos:
   - Criar assinatura recorrente por canal.
   - Registrar a relacao entre `ChannelSubscription` e a assinatura externa.
   - Liberar feed e modulos somente com assinatura ativa confirmada.

3. Agendamentos pagos:
   - Salvar preco e status de pagamento no agendamento.
   - Cobrar antes da confirmacao da consulta ou treino.
   - Confirmar agenda so apos webhook de pagamento.

4. Split e repasse:
   - Registrar transacoes da plataforma e do profissional.
   - Definir se o split sera automatico via subcontas/carteiras ou manual no inicio.
   - Expor relatorio de saldo para profissionais.

## Ajustes de dados recomendados antes de ir para producao

- Criar uma tabela de transacoes com `provider`, `externalId`, `type`, `status`, `grossAmount`, `netAmount`, `feeAmount`, `userId`, `channelId`, `scheduleId`.
- Adicionar em `ChannelSubscription` os ids externos da assinatura e o status de cobranca.
- Adicionar em `Schedule` campos de preco, status de pagamento e referencia externa.
- Padronizar auditoria de aprovacao de plano, email e profissional.

## Operacao segura minima para lancar

- Banco Postgres gerenciado com backup automatico.
- Upload de imagens e videos fora do disco local.
- Segredos em cofre, nunca em `.env` de servidor manual.
- Webhooks protegidos com token/assinatura e log de tentativas.
- Rate limit persistente com Redis, nao apenas memoria local.
- Observabilidade basica: erros, filas, webhooks, pagamentos e tarefas falhas.

## Referencias oficiais usadas nesta fase

- Autenticacao Asaas: `https://docs.asaas.com/docs/autentica%C3%A7%C3%A3o-1`
- Assinaturas Asaas: `https://docs.asaas.com/docs/assinaturas`
- Webhooks Asaas: `https://docs.asaas.com/docs/sobre-os-webhooks`
- Split de pagamentos Asaas: `https://docs.asaas.com/docs/split-de-pagamentos`
