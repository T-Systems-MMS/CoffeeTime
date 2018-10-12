import { Injectable, Logger } from '@nestjs/common';
import { Interval, NestSchedule, defaults } from 'nest-schedule';
import { AWSBeService } from 'awsbe.service';

defaults.enable = true;
defaults.maxRetry = -1;
defaults.retryInterval = 5000;

@Injectable()
export class ScheduleService extends NestSchedule {
  constructor(private awsBeService: AWSBeService) {
    super();
  }

  @Interval(2000)
  logMich(): void {
    this.awsBeService.update();

  }
}