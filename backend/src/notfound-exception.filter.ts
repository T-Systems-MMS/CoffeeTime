import { Catch, NotFoundException, ExceptionFilter } from '@nestjs/common';
import { join } from 'path';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, response) {
    response.sendFile(join(__dirname, '..', '..', 'frontend', 'dist', 'frontend', 'index.html'));
  }
}
