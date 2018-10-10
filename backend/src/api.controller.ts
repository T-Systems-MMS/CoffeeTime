import { Get, Controller,  Headers, Logger } from '@nestjs/common';
import { RoomService } from './room.service';
import { Room } from './domain/room';

@Controller()
export class ApiController {
  constructor(private readonly appService: RoomService) {}

  @Get('/api/rooms')
  rooms(@Headers() headers): Array<Room> {
    return this.appService.rooms();
  }
}
