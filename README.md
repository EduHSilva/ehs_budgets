# 📊 EHS Orçamentos – Frontend

Aplicação web da **EHS Orçamentos**, plataforma da EHS Solutions para prestadores de
serviço criarem orçamentos, organizarem clientes, acompanharem a execução no kanban e
gerenciarem lembretes.

Este repositório contém apenas o **cliente web**, que consome os microservices pela API.

## Estrutura

- `web/` — aplicação Nuxt (código, configuração e assets).
- `Dockerfile`, `docker-compose.yaml` e `docker/` — publicação em `/app/budgets/`.
- `.github/` — CI e publicação da imagem `budgets-ui`.

```bash
cd web
pnpm install
pnpm dev
```

Em produção o app é servido pelo nginx dos microservices em
`http://localhost/app/budgets/`, com a API na mesma origem (`/budgets`, `/users`).

---

## 🎯 Problema

Prestadores de serviço ainda dependem de planilhas e ferramentas genéricas para montar
orçamentos, controlar o que foi aprovado e acompanhar a execução. Isso dificulta:

- Padronizar e reaproveitar orçamentos
- Saber o que está pendente, aprovado ou em execução
- Manter histórico de clientes e valores
- Enxergar o andamento do trabalho no dia a dia

## 💡 Solução

Uma interface simples e objetiva para criar orçamentos, acompanhar status, organizar a
execução em kanban e registrar lembretes, integrada aos microservices via API.

## 🚀 Principais recursos

- Cadastro de clientes
- Orçamentos com itens, subtotal, validade e termos
- Pipeline de status e kanban de execução
- Dashboard com indicadores e orçamentos recentes
- Geração de PDF e envio por WhatsApp
- Lembretes (atualmente local, ver `TODO.md`)
- PWA instalável

## 🧱 Arquitetura

**Stack:** Nuxt 4, Vue 3, TypeScript, Nuxt UI, Tailwind, Zod, PWA.

```text
[ Web (Nuxt) ] <-> API Gateway <-> Microservices <-> PostgreSQL
```

O frontend é desacoplado e comunica exclusivamente por HTTP com o gateway.

## ⚙️ Rodando localmente

Pré-requisitos: Node.js 20+, pnpm 10 e a stack de `ehs_microservices` no ar.

```bash
cd web
pnpm install
pnpm dev
```

Aplicação em `http://localhost:3000`.

### Variáveis de ambiente

Crie `web/.env`:

```env
NUXT_APP_BASE_URL=/
NUXT_PUBLIC_API_URL=http://localhost:8080
NUXT_PUBLIC_GOOGLE_CLIENT_ID=
```

`NUXT_PUBLIC_API_URL` aponta para o gateway; vazio usa a mesma origem (produção atrás do
nginx).

## 📚 Documentação local

- `TODO.md` — mapeamento do que está integrado/mockado, testes e pendências (não versionado).
