import { Module, HttpModule } from '@nestjs/common';
import { ApiController } from './api.controller';
import { RoomService } from './room.service';
import { ScheduleService } from 'schedule.service';
import { AWSBeService } from 'awsbe.service';

@Module({
  imports: [ HttpModule.register({
    proxy: false,
  }) ],
  controllers: [ApiController],
  providers: [RoomService, ScheduleService, AWSBeService],
})
export class AppModule {}
