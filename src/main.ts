import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
void bootstrap()
  .catch((err) => console.error(err))
  .then(() => console.log('Application terminated unexpectedly'));
