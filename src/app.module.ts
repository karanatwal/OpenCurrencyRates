// app.module.ts
import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { CurrencyModule } from "./currency/currency.module";

const { DiskStore } = require("cache-manager-fs-hash");

@Module({
  imports: [
    CacheModule.register({
      store: new DiskStore({
        path: ".cache", // Directory for cached files
        ttl: 60 * 60 * 24, // 24 hours
        hash: false, // Use plain keys as filenames
      }),
      isGlobal: true, // Optional: make cache available app-wide
    }),
    CurrencyModule,
  ],
})
export class AppModule {}
