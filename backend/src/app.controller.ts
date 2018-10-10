import { Get, Controller,  Headers, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { Room } from './domain/room';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/api')
  api(@Headers() headers): Array<Room> {
    return this.appService.root();
  }
}
