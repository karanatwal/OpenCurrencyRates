# OpenCurrencyRates (Currency Exchange/ Currency Converter API)

# 🌍 Simple Currency API

A lightweight hobby project built with **NestJS** to demonstrate caching, dynamic currency conversion, and REST API design.

> ✨ **Free to use for learning, college projects, or personal experiments!**  
> ⚠️ Hosted on Render’s free tier — don’t expect high uptime or speed 😄

---

## 🚀 Endpoints

### Currencies Metadata
- **Method**: GET  
- **Path**: `/api/currencies`  
- **Description**: Returns metadata for all supported currencies (name, symbol).

**Example request:**  
`https://opencurrencyrates.onrender.com/api/currencies`

**Example response:**
```json
{
    "time_last_update_unix": 1760832151,
    "time_next_update_unix": 1760920141,
    "data": [
        {
            "countryName": "United States",
            "countryCode": "US",
            "symbol": "$",
            "flag": "🇺🇸",
            "currency": "USD"
        },
        {
            "countryName": "United Arab Emirates",
            "countryCode": "AE",
            "symbol": "د.إ",
            "flag": "🇦🇪",
            "currency": "AED"
        },
    ]
}
```

### Exchange Rates by Base Currency
- **Method**: GET  
- **Path**: `/api/currency/:base`  
- **Description**: Returns exchange rates relative to the given base currency (e.g., `INR`, `EUR`).

**Example request:**  
`https://opencurrencyrates.onrender.com/api/currency/INR`

`/api/currency/:base` endpoint supports two optional query parameters for flexible responses:

- `metadata=true` → includes extra metadata.
- `currencies=INR,USD,SGD,...` → returns rates **only for the specified currencies**.

**Example request:**  
`https://opencurrencyrates.onrender.com/api/currency/GBP?metadata=false&currencies=INR,HKD`

**Example response:**
```json
{
    "base": "GBP",
    "time_last_update_unix": 1760832151,
    "time_next_update_unix": 1760920381,
    "data": {
        "HKD": 10.43,
        "INR": 118.145
    }
}
```

✅ To show country's flag in UI, use country code from metadata and put it in [FlagAPI](https://flagsapi.com/) e.g. `https://flagsapi.com/IN/flat/64.png`  
✅ Any currency can be used as **base**  
✅ Rates updated **once per day** (cached to reduce cost)

---

## 💡 How It Works

- The app fetches exchange rate data from a public free-tier API.
- Responses are **cached to disk** using `cache-manager-fs-hash`, ensuring the upstream API is called **only once per 24 hours** — even after cold starts on Render.
- Built with **NestJS** and deployed on **Render**’s free tier.

---

## 🛠️ For Developers

Feel free to:
- Use this API in **college assignments**, **side projects**, or **demos**.
- Study the code: modular NestJS structure, file-based caching, dynamic base conversion.
- Fork and extend it!

> 🔒 **Please be kind**: This runs on a **free Render instance**. Avoid aggressive polling or high-volume requests.

---

## 📈 Need Professional Exchange Rates?

For production-grade applications (fintech, e-commerce, etc.), consider these reliable services:

- [Open Exchange Rates](https://openexchangerates.org/)
- [ExchangeRate-API](https://www.exchangerate-api.com/)
- [CurrencyAPI](https://currencyapi.com/)
- [Fixer.io](https://fixer.io/)

They offer **higher rate limits**, **historical data**, **webhooks**, and **SLA-backed uptime**.

---

## 🙌 Made With

- [NestJS](https://nestjs.com/)
- [cache-manager-fs-hash](https://www.npmjs.com/package/cache-manager-fs-hash)
- [Render](https://render.com/)

---

> 🎓 **Built as a learning exercise — hope it helps you too!**  
> — Happy coding 💻

