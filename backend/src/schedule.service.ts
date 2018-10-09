import { Injectable, Logger } from '@nestjs/common';
import { Interval, NestSchedule, defaults } from 'nest-schedule';

defaults.enable = true;
defaults.maxRetry = -1;
defaults.retryInterval = 5000;

@Injectable()
export class ScheduleService extends NestSchedule {
  constructor() {
    super();
  }

  @Interval(20000)
  logMich(): void {
    Logger.warn('Scheduled');

  }
}