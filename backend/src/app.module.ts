import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { RoomService } from './room.service';
import { ScheduleService } from 'schedule.service';

@Module({
  imports: [],
  controllers: [ApiController],
  providers: [RoomService, ScheduleService],
})
export class AppModule {}
