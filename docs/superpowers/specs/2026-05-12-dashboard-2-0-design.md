# Dashboard 2.0 Design

**Date:** 2026-05-12
**Status:** Approved in chat, pending file review

## Goal

Rebuild the financial dashboard around the real Clinica Experts API behavior instead of the obsolete local documentation, using `sales`, `bills`, and `parcels` as the primary data sources, with clickable KPIs, drill-down tables, and item detail drawers.

## Scope

### In scope

- `/dashboard` implemented on top of the real API contract
- Period filter with presets:
  - today
  - 7 days
  - 30 days
  - current month
  - previous month
  - custom range
- Server-side paginated loading for:
  - `GET /sales`
  - `GET /bills`
  - `GET /parcels`
  - `GET /patients`
  - `GET /financial-categories`
- Analytical views for:
  - sales
  - bills
  - parcels
- Clickable KPI cards
- Daily multi-line chart
- Real tables with row click and detail drawer
- Local documentation update to reflect the real API

### Out of scope for this cycle

- `bookings`
- `professionals`

These endpoints are currently inconsistent or unavailable in the proxy/API tests and should be tracked only as future integration work.

## Real API Contract

### `GET /sales`

Uses query params:

- `starts_at`
- `ends_at`

Expected fields used by the dashboard:

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

### `GET /bills`

Uses query params:

- `starts_at`
- `ends_at`

Notes:

- The existing local doc using `start_date` and `end_date` is incorrect.

Expected fields used by the dashboard:

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

### `GET /parcels`

Uses query params:

- `starts_at`
- `ends_at`

Expected fields used by the dashboard:

- `uuid`
- `due_date`
- `execution_date`
- `compensation_date`
- `calc_compensation_date`
- `status`
- `parcel_number`
- `payment_method`
- `financial_account`

### Auxiliary endpoints

- `patients`: available
- `financial-categories`: available
- `bookings`: failed in real tests
- `professionals`: failed in real tests

## Architecture

The dashboard should be implemented as a server-first App Router page under `/dashboard`.

The active date range is represented in the URL and defaults to the current month. On request, the server loads all required pages from the real API for the selected interval, normalizes each domain payload, and computes a stable internal dashboard model before rendering UI.

The UI should not depend on raw API payloads directly. Instead, server-side aggregation produces:

- overview KPIs
- daily time-series
- ranked analytical summaries
- normalized table rows
- lookup maps for drill-down by `uuid`

Client-side components are restricted to interaction concerns:

- changing the date range
- switching domain tabs/views
- applying contextual filters from KPI clicks
- selecting rows
- opening and closing detail drawers

This allows drill-down detail to render from already loaded objects without requiring per-item fetches.

## Functional Decomposition

### 1. Data infrastructure

- paginated fetch client for each resource
- defensive parsing and normalization of real API payloads
- shared date range parameter handling using `starts_at` and `ends_at`
- error isolation per domain
- optional enrichment loading for `patients` and `financial-categories`

### 2. Analytics engine

- overview KPI calculation
- daily chart series generation
- grouping and ranking by domain
- parcel classification:
  - receivable
  - payable
  - overdue
  - compensated
  - open

### 3. Page shell

- header with period presets and custom range
- overview KPI grid
- daily multi-line chart
- analytical workspace with domain tabs

### 4. Exploration surfaces

- sales table
- bills table
- parcels table
- contextual drill-down state
- side drawer detail views

### 5. Delivery governance

- local docs aligned to the real API
- focused tests for high-risk logic
- manual validation using real loaded data

## Screen Behavior

### Header

The page header exposes:

- active date range
- quick presets
- custom range inputs

The default range is the current month.

Changing the range reloads the dashboard consistently and preserves the selected interval in the URL.

### Overview block

Primary KPIs:

- gross revenue via `sales.final_amount`
- sales count
- average ticket
- period expenses via `bills.final_amount`
- operating balance = sales - expenses
- accounts receivable via parcels
- accounts payable via parcels
- overdue parcels
- active vs inactive sales rate

Each KPI is clickable and changes the analytical context below.

Examples:

- clicking revenue focuses the sales table
- clicking expenses focuses bills
- clicking overdue parcels filters the parcels view to delayed/open items

### Main chart

Primary chart is a daily multi-series line chart with:

- sales by day
- expenses by day
- balance by day
- optional receivables by day

### Analytical workspace

The lower area should be organized by domain tabs:

- Sales
- Bills
- Parcels

Each domain combines summary cards/charts plus a real table.

#### Sales analyses

- revenue by seller
- revenue by payment method
- revenue by procedure
- top patients by purchase value
- installment vs single payment
- active vs inactive status
- real sales table

#### Bills analyses

- expenses by category
- expenses by type
- expenses by person/supplier
- daily expense evolution
- top bills by amount
- real bills table

#### Parcels analyses

- parcel status distribution
- receivable vs payable
- overdue parcels
- by financial account
- by payment method
- real parcels table

## Detail Drawer

Clicking a row opens a side drawer using the already loaded object.

### Sale detail

Show:

- `uuid`
- sale name
- date
- status
- buyer
- seller
- nominal and final values
- procedures
- payment methods
- fees
- net value when derivable

### Bill detail

Show:

- `uuid`
- type
- description
- person/supplier
- category
- emission date
- final value
- balance
- linked parcels from `payment_methods[].parcels[]`

### Parcel detail

Show:

- `uuid`
- status
- due date
- execution date
- compensation date
- financial account
- payment method
- parcel number

## Data Resilience

### Pagination

The implementation must not assume a single page response. It should accumulate all pages for the selected interval with:

- explicit stop conditions
- protection against pagination loops
- failure handling for malformed page metadata

### Optional data

The system must tolerate missing or partial fields, especially in:

- `payment_methods`
- nested `parcels`
- `procedures`
- `buyer`
- `seller`
- `category`
- `person`

### Domain failure rules

- If `sales`, `bills`, or `parcels` fail, the affected domain must show a visible error state because they are structural.
- If `patients` or `financial-categories` fail, the dashboard should still render with degraded enrichment.

## Testing Strategy

Focus tests on the highest-risk logic:

- API response normalization
- paginated accumulation
- KPI calculation
- daily series generation
- parcel classification
- contextual filtering from KPI actions
- detail drawer rendering with optional fields

## Manual Validation

Primary manual scenarios:

1. Load dashboard with current month default
2. Change preset to another range
3. Confirm KPI totals update consistently
4. Click revenue and inspect sales table context
5. Click expenses and inspect bills table context
6. Click overdue parcels and inspect parcels filter
7. Open detail drawer for one item in each domain

## Delivery Phasing

### Phase 1

- rebuild sales and bills
- paginated fetch
- month period
- real KPIs
- temporal line chart
- clickable tables
- detail drawer

### Phase 2

- integrate parcels
- receivables and payables
- overdue logic
- parcel detail

### Phase 3

- status filters
- person/seller filters
- groupings
- period comparison
- export

### Phase 4

If API support becomes stable:

- bookings
- professionals
- deeper productivity and no-show analysis

## Implementation Direction

The recommended implementation approach is:

1. server-first dashboard page
2. centralized aggregation layer in `lib/`
3. normalized internal models per domain
4. client-side interaction only for filters, selection, and drill-down

This keeps the page aligned with the real API behavior, reduces duplication, and provides a stable foundation for future additions without relying on the obsolete documentation.
