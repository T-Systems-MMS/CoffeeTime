import { Injectable, Logger } from '@nestjs/common';
import { Interval, NestSchedule, defaults } from 'nest-schedule';
import { AWSBeService } from './awsbe.service';

defaults.enable = true;
defaults.maxRetry = -1;
defaults.retryInterval = 5000;

const INTERVAL = 10000; // 15 * 60 * 1000;

@Injectable()
export class ScheduleService extends NestSchedule {
    constructor(private awsBeService: AWSBeService) {
        super();
    }

    @Interval(INTERVAL)
    logMich(): void {
        this.awsBeService.update();
    }
}