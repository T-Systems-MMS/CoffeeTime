import { Catch, NotFoundException, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { join } from 'path';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    host.switchToHttp().getResponse().sendFile(join(__dirname, '..', '..', 'frontend', 'dist', 'frontend', 'index.html'));
  }
}
