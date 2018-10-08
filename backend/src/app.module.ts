import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleService } from 'schedule.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ScheduleService],
})
export class AppModule {}
