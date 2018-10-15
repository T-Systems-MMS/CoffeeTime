import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { NotFoundExceptionFilter } from 'notfound-exception.filter';
import * as compression from 'compression';
import * as sslRedirect from 'heroku-ssl-redirect';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(sslRedirect());
    app.use(compression());
    app.useStaticAssets(
        join(__dirname, '..', '..', 'frontend', 'dist', 'frontend'),
        {
            prefix: '/',
            fallthrough: true,
        },
    );
    const port = process.env.PORT || 3000;
    Logger.log(`Listening on port ${port}`);
    app.useGlobalFilters(new NotFoundExceptionFilter());
    await app.listen(port);
}
bootstrap();
