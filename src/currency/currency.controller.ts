import { Controller, Get, Param, Res, HttpStatus, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { Response } from 'express';

@Controller()
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('currencies')
  async getCurrencies(@Res() res: Response) {
    try {
      const payload = await this.currencyService.listCurrenciesWithMeta();
      // set cache headers for CDN
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
      return res.status(HttpStatus.OK).json(payload);
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'failed' });
    }
  }

  @Get('currency/:base')
  async getRates(
    @Param('base') base: string,
    @Query('currencies') currencies: string | undefined,
    @Query('additionalFields') additionalFields: string | undefined,
    @Res() res: Response,
  ) {
    try {
      const includeFields = additionalFields === 'true' || additionalFields === '1';
      const wanted = currencies ? currencies.split(',').map((s) => s.trim().toUpperCase()) : undefined;
      const payload = await this.currencyService.ratesRelativeTo(base.toUpperCase());
      // payload has { base, time_last_update_unix, time_next_update_unix, data }
      let data = payload.data;
      if (wanted && wanted.length > 0) {
        data = data.filter((item: any) => wanted.includes(item.currency));
      }
      // if additionalFields is false, return a simple map { CODE: value }
      const result = includeFields
        ? { base: payload.base, time_last_update_unix: payload.time_last_update_unix, time_next_update_unix: payload.time_next_update_unix, data }
        : { base: payload.base, time_last_update_unix: payload.time_last_update_unix, time_next_update_unix: payload.time_next_update_unix, data: Object.fromEntries(data.map((d: any) => [d.currency, d.value])) }

      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=3600');
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: (err as Error).message });
    }
  }
}
