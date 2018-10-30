import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import { NotFoundExceptionFilter } from './notfound-exception.filter';
import * as compression from 'compression';

function sslRedirect(environments = ['production'], status = 302) {
    return function(req, res, next) {
        // on heroku NODE_ENV defaults to 'production'
        if (environments.indexOf(process.env.NODE_ENV) >= 0) {
            // look at headers to identify proto (https://devcenter.heroku.com/articles/http-routing#heroku-headers)
            if (req.headers['x-forwarded-proto'] !== 'https') {
                res.redirect(status, 'https://' + req.hostname + req.originalUrl);
                return;
            }
        }
        next();
    };
}

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
    Logger.log(`Listening on port ${port}`, bootstrap.name);
    app.useGlobalFilters(new NotFoundExceptionFilter());
    if (process.env.NODE_ENV !== 'production') {
        app.enableCors({ origin: '*' });
    }
    await app.listen(port);
}
bootstrap();
