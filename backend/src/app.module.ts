import { Module, HttpModule } from '@nestjs/common';
import { ApiController } from './api.controller';
import { RoomService } from './room.service';
import { ScheduleService } from 'schedule.service';
import { AWSBeService } from 'awsbe.service';
import { StorageService } from 'storage.service';

@Module({
  imports: [ ],
  controllers: [ApiController],
  providers: [RoomService, ScheduleService, AWSBeService, StorageService],
})
export class AppModule {}
