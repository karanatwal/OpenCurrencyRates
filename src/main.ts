import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); // loads .env
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port, "0.0.0.0");
  console.log(`Listening on http://0.0.0.0:${port}`);
}

bootstrap();
