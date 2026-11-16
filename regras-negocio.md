# Regras de negócio — EHS Orçamentos

> Produto para prestadores de serviço: cliente → orçamento → envio → aprovação → kanban.
> Plataforma (auth, roles, isolamento): `D:/Projetos/ehs_microservices/regras-negocio.md`.

## Marca

- Nome exibido na web: **Orçamentos** (título, PWA e menu). Identificadores internos
  (`crm`, `BUDGETS`) não mudam.
- O rodapé exibe "Orçamentos • Desenvolvido por EHS Solutions".

## Cliente

- Todo cliente pertence ao usuário logado (isolamento por `user_id`).
- Status (`ClientStatus`): `NEW` ao criar, `WORKING`, `DONE` e `DELETED` (exclusão).
  - A edição altera `NEW`/`WORKING`/`DONE`; `DELETED` no `PUT` é rejeitado (400).
  - Exclusão é soft delete via `DELETE`.
- Campos: nome (obrigatório), e-mail, telefone e observações. E-mail inválido → 400.

## Orçamento

- Todo orçamento nasce `DRAFT` e pertence ao usuário; o cliente vinculado também precisa
  ser dele.
- Status (`BudgetStatus`): `DRAFT`, `SEND`, `WAITING`, `APPROVED`, `WORKING`, `DONE`,
  `CANCEL`, `DENY`, `DELETED`.
  - Transições permitidas (validadas no `PUT`; fora da matriz → 400):
    `DRAFT → SEND`; `SEND → WAITING`; `WAITING → APPROVED | DENY`;
    `APPROVED → WORKING`; `WORKING → DONE`; qualquer status `→ CANCEL`.
    `DELETED` só via `DELETE` (o `PUT` continua rejeitando).
  - Manter o mesmo status é permitido (edição sem mudar de etapa). `DONE`, `DENY` e
    `CANCEL` são finais: só aceitam `CANCEL` ou exclusão.
  - `?status=` inválido na listagem retorna 400.
- Itens: descrição, quantidade e preço unitário. Subtotal = preço × quantidade;
  total do orçamento = soma dos subtotais. A edição substitui a lista de itens.
  Na criação é exigido ao menos um item; na edição a lista pode vir vazia.
- Cliente não é alterado na edição do orçamento (fica travado no modal).
- `kanbanOrder` é a posição do card na coluna; arrastar atualiza status + posição e
  reordena os vizinhos da coluna de destino.
- Exclusão é soft delete; o dashboard ignora registros `DELETED`.

## Fluxo de acompanhamento

- Quadro/kanban: colunas `news` (`APPROVED`), `working` (`WORKING`) e `done` (`DONE`).
  `DRAFT`, `SEND`, `WAITING`, `CANCEL` e `DENY` não aparecem no quadro.
  - O arrasto só avança uma coluna por vez (`APPROVED → WORKING → DONE`); mover para
    trás é bloqueado no cliente (o backend também rejeita com 400).
- Aprovação do orçamento = `PUT` com `status=APPROVED` a partir de `WAITING` (o botão
  "Aprovar" só aparece nesse status).
- Dashboard: total de clientes, serviços pendentes (`APPROVED` = aprovados pelo cliente e
  ainda sem execução), serviços em andamento (`WORKING`) e total recebido (soma dos itens
  de orçamentos `DONE`) — tudo do usuário do token.

## Documento

- O preview mostra itens, subtotal, total, termos e observações.
- O PDF é gerado no navegador (jsPDF) e o envio usa Web Share API, com fallback de
  download + WhatsApp Web.
- Valores são formatados em BRL (moeda não configurável hoje).

## Cadastro e acesso

- O login usa `app: BUDGETS`; o cadastro cria a conta com role `BUDGETS` e empresa
  automática.
- A conta nova nasce `WAITING_CONFIRMATION` e precisa do e-mail de confirmação.
