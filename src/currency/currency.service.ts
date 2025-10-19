import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { Cache } from "cache-manager";
import { Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import * as currencyMeta from "../data/currencies.json";

interface ExchangeRatesResponse {
  result: string;
  base_code: string;
  time_last_update_utc: string;
  time_last_update_unix?: number;
  time_next_update_unix?: number;
  rates: Record<string, number>;
}

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private cacheKey = "exchange_rates";
  // dedupe concurrent fetches
  private fetchPromise: Promise<ExchangeRatesResponse> | null = null;

  constructor(
    private http: HttpService,
    @Inject(CACHE_MANAGER) private cache: Cache
  ) {}

  async fetchAndCache() {
    if (this.fetchPromise) return this.fetchPromise;
    this.fetchPromise = (async () => {
      try {
        // discover URL from environment variable .env file
        let url: string | undefined = process.env.RATES_SOURCE_URL;
        if (!url) throw new Error("RATES_SOURCE_URL is required");

        const response$ = this.http.get<ExchangeRatesResponse>(url);
        const response = await lastValueFrom(response$);
        const data = response.data;
        // determine TTL based on API's next update unix timestamp
        const now = Math.floor(Date.now() / 1000);
        const next = data.time_next_update_unix || now + 3600;
        // add small buffer (e.g., 5 minutes) to ensure cache lives slightly longer
        const buffer = 60 * 5;
        let ttl = Math.max(60, next - now + buffer) * 1000;
        // set in seconds for cache-manager
        try {
          await this.cache.set(this.cacheKey, data, ttl);
          this.logger.log(`cache set with ttl ${ttl / 1000} seconds`);

          // 🔍 Verify immediately
          const verify = await this.cache.get(this.cacheKey);
          this.logger.log(`Cache verify after set: ${verify ? "HIT" : "MISS"}`);
        } catch (e) {
          // if cache-manager fails for some reason, still keep in-memory copy
          this.logger.warn(`cache-manager set failed : ${e.message}`);
        }
        this.logger.log("Fetched and cached latest rates");
        return data;
      } catch (err) {
        this.logger.error("Failed to fetch rates", err as any);
        throw err;
      } finally {
        this.fetchPromise = null;
      }
    })();
    return this.fetchPromise;
  }

  async getCached() {
    // 1. Check Cache
    this.logger.log(`Attempting to get cache with key: "${this.cacheKey}"`);

    const cached = await this.cache.get<ExchangeRatesResponse>(this.cacheKey);
    this.logger.log(`Cache result: ${cached ? "HIT" : "MISS"}`);
    if (cached) {
      // 2. Cache Hit (The "next time" response)
      return cached as ExchangeRatesResponse;
    }
    // 3. Cache Miss (The "first time" fetch)
    return this.fetchAndCache();
  }

  async listCurrenciesWithMeta() {
    // Ensure we use the latest fetched rates so we only return supported currencies
    const data = await this.getCached();
    const rates = data.rates || {};
    const codes = Object.keys(rates);
    const list = codes.map((code) => {
      const meta = (currencyMeta as any)[code] || {};
      return {
        countryName: meta.countryName || meta.country || null,
        countryCode: meta.countryCode || meta.country || null,
        symbol: meta.symbol || null,
        flag: meta.flag || null,
        currency: code,
      };
    });
    return {
      time_last_update_unix: data.time_last_update_unix || null,
      time_next_update_unix: data.time_next_update_unix || null,
      data: list,
    };
  }

  async ratesRelativeTo(base: string) {
    const data = await this.getCached();
    const rates = data.rates;
    if (!rates[base]) {
      throw new Error(`Base currency ${base} not supported`);
    }
    const baseRate = rates[base];
    // Build array of currency objects (same shape as listCurrenciesWithMeta) plus `value` field
    const codes = Object.keys(rates);
    const list = codes.map((code) => {
      const meta = (currencyMeta as any)[code] || {};
      const value = parseFloat((rates[code] / baseRate).toFixed(3)); // how many units of `code` per 1 `base`
      return {
        countryName: meta.countryName || meta.country || null,
        countryCode: meta.countryCode || meta.country || null,
        symbol: meta.symbol || null,
        flag: meta.flag || null,
        currency: code,
        value,
      };
    });
    return {
      base,
      time_last_update_unix: data.time_last_update_unix || null,
      time_next_update_unix: data.time_next_update_unix || null,
      data: list,
    };
  }
}
