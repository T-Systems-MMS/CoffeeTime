import { Get, Controller,  Headers, Put, Param, HttpException, Body, Post, Delete } from '@nestjs/common';
import { RoomService } from './room.service';
import { Push } from './domain/push';
import { PushSubscription } from './domain/pushsubscription';
import { PushUnSubscription } from './domain/pushunsubscription';
import { PushService } from './push.service';
import { RoomData } from './domain/schema/roomdata.interface';

@Controller()
export class ApiController {
  private static AUTH_HEADER_NAME = 'PUSH_SUBSCRIPTION_AUTH'.toLowerCase();
  constructor(private readonly roomService: RoomService, private readonly pushService: PushService) {}

  @Get('/api/rooms')
  rooms(@Headers(ApiController.AUTH_HEADER_NAME) subscriptionAuth): Promise<Array<RoomData>> {
    return this.roomService.rooms(subscriptionAuth);
  }

  @Put('/api/room/:room_id/push')
  addPush(@Param('room_id') id, @Headers(ApiController.AUTH_HEADER_NAME) subscriptionAuth, @Body() push: Push ): void {
    if (!subscriptionAuth){
      throw new HttpException('Missing Auth Header', 400);
    }
    this.pushService.update(subscriptionAuth, id, push);
  }

  @Get('/api/room/:room_id')
  getRoomInfo(@Param('room_id') roomId){
    return this.roomService.room(roomId);
  }

  @Post('/api/push')
  createPush(@Body() pushSubscription: PushSubscription){
    this.pushService.save(pushSubscription);
  }

  @Delete('/api/push')
  deletePush(@Body() pushUnSubscription: PushUnSubscription){
    this.pushService.delete(pushUnSubscription.auth);
  }
}
