# OpenCurrencyRates (Currency Exchange/ Currency Converter API)

Small NestJS service that fetches rates from different sources, enriches with metadata and exposes two endpoints:

- GET /api/currencies -> list of currency codes with metadata
- GET /api/currency/:base -> rates relative to :base currency

Notes:

- The service caches fetched data in Nest's cache manager and refreshes on next available update
