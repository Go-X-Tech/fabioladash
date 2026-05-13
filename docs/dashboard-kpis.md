# Dashboard KPIs - Clinica Experts API Real

API Base: `https://api.clinicaexperts.com.br/api/v1`  
Auth: `Authorization: Bearer YOUR_API_KEY`

## Base real do Dashboard 2.0

O dashboard deve ser orientado pela resposta real da API, nao pela doc antiga quando houver divergencia.

### Endpoints estruturais

1. `GET /sales`
2. `GET /bills`
3. `GET /parcels`

### Endpoints auxiliares hoje aproveitaveis

1. `GET /patients`
2. `GET /financial-categories`

### Endpoints fora da entrega atual

1. `GET /bookings`
2. `GET /professionals`

Esses endpoints estao inconsistentes ou indisponiveis no proxy atual e nao devem ser base do Dashboard 2.0 neste ciclo.

---

## 1. Receita - Sales

**Endpoint:** `GET /sales`

**Query real:** `starts_at`, `ends_at`, `page`

**Campos reais usados:**

- `uuid`
- `type`
- `name`
- `sale_date`
- `due_date`
- `status`
- `buyer`
- `seller`
- `nominal_amount`
- `discount_amount`
- `addition_amount`
- `final_amount`
- `payment_methods[]`
- `procedures[]`

**KPIs principais:**

- faturamento bruto: soma de `final_amount`
- quantidade de vendas
- ticket medio
- total liquido
- desconto total
- taxas totais das formas de pagamento
- faturamento por vendedora
- faturamento por forma de pagamento
- faturamento por procedimento
- top pacientes por valor comprado
- vendas parceladas vs a vista
- status active vs inactive

---

## 2. Despesas - Bills

**Endpoint:** `GET /bills`

**Query real:** `starts_at`, `ends_at`, `page`

**Importante:** a doc antiga com `start_date` e `end_date` esta errada.

**Campos reais usados:**

- `uuid`
- `type`
- `description`
- `amount`
- `nominal_amount`
- `discount_amount`
- `fees_amount`
- `final_amount`
- `net_amount`
- `balance`
- `emission_date`
- `category`
- `person`
- `payment_methods[].parcels[]`

**KPIs principais:**

- despesas do periodo: soma de `final_amount`
- custo por categoria
- custo por tipo
- custo por pessoa/fornecedor
- despesas operacionais vs financeiras
- top despesas por valor

---

## 3. Fluxo - Parcels

**Endpoint:** `GET /parcels`

**Query real:** `starts_at`, `ends_at`, `page`

**Campos reais usados:**

- `uuid`
- `due_date`
- `execution_date`
- `compensation_date`
- `calc_compensation_date`
- `status`
- `parcel_number`
- `payment_method`
- `financial_account`

**KPIs principais:**

- contas a receber
- contas a pagar
- parcelas vencidas
- volume por conta financeira
- volume por metodo de pagamento
- status das parcelas

---

## Tabelas reais

### Sales

- data
- paciente
- vendedor
- procedimento principal
- status
- valor final
- valor liquido
- parcelas / forma de pagamento

### Bills

- emissao
- descricao
- tipo
- categoria
- pessoa
- valor final
- saldo

### Parcels

- vencimento
- status
- conta financeira
- metodo
- parcela
- compensacao

---

## Drill-down esperado

### Clique em KPI

- faturamento -> tabela de `sales`
- despesas -> tabela de `bills`
- parcelas vencidas -> tabela de `parcels` filtrada

### Clique em linha

Abrir drawer lateral usando o objeto ja carregado na listagem.

### Detalhe de Sale

- `uuid`
- nome
- data
- status
- comprador
- vendedor
- valores nominais/finais
- procedimentos
- formas de pagamento
- taxas
- valor liquido

### Detalhe de Bill

- `uuid`
- tipo
- descricao
- pessoa
- categoria
- emissao
- valor final
- saldo
- parcelas vinculadas em `payment_methods[].parcels[]`

### Detalhe de Parcel

- `uuid`
- status
- vencimento
- execucao
- compensacao
- conta financeira
- metodo de pagamento
- numero da parcela
