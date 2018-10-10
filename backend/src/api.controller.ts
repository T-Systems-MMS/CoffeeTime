import { Get, Controller,  Headers, Logger, Put, Param, HttpException, Body, Post, Delete } from '@nestjs/common';
import { RoomService } from './room.service';
import { Room } from './domain/room';
import { Push } from './domain/push';
import { PushSubscription } from './domain/pushsubscription';
import { PushUnSubscription } from './domain/pushunsubscription';

@Controller()
export class ApiController {
  private static AUTH_HEADER_NAME = 'PUSH_SUBSCRIPTION_AUTH'.toLowerCase();
  constructor(private readonly roomService: RoomService) {}

  @Get('/api/rooms')
  rooms(@Headers(ApiController.AUTH_HEADER_NAME) subscriptionAuth): Array<Room> {
    return this.roomService.rooms();
  }

  @Put('/api/room/:room_id/push')
  addPush(@Param('room_id') id, @Headers(ApiController.AUTH_HEADER_NAME) subscriptionAuth, @Body() push: Push ): void {
    if (!subscriptionAuth){
      throw new HttpException('Missing Auth Header', 400);
    }
    Logger.log(`Got Room id: ${id}`);
    Logger.log(`Body: ${push}`);
  }

  @Get('/api/room/:room_id')
  getRoomInfo(@Param('room_id') roomId){
    return this.roomService.room(roomId);
  }

  @Post('/api/push')
  createPush(@Body() pushSubscription: PushSubscription){
    Logger.log(`Body: ${pushSubscription}`);
  }

  @Delete('/api/push')
  deletePush(@Body() pushUnSubscription: PushUnSubscription){
    Logger.log(`Body: ${pushUnSubscription}`);
  }
}