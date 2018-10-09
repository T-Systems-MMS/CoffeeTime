import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useStaticAssets(
   join(__dirname, '..', '..', 'frontend', 'dist', 'frontend'),
   {
      prefix: '/',
   },
  );
  const port = process.env.PORT || 3000;
  Logger.log(`Listening on port ${port}`);
  await app.listen(port);
}
bootstrap();
