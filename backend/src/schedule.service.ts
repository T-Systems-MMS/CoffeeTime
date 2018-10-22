import { Injectable, Logger } from '@nestjs/common';
import { Interval, NestSchedule, defaults } from 'nest-schedule';
import { AWSBeService } from './awsbe.service';
import { PushService } from './push.service';
import { RoomService } from './room.service';

defaults.enable = true;
defaults.maxRetry = -1;
defaults.retryInterval = 5000;

const AWS_POLL_INTERVAL = 60 * 1000;
const PUSH_CHECK_INTERVAL = 60 * 1000;

@Injectable()
export class ScheduleService extends NestSchedule {
    constructor(private awsBeService: AWSBeService, private roomService: RoomService, private pushService: PushService) {
        super();
    }

    @Interval(AWS_POLL_INTERVAL)
    logMich(): void {
        this.awsBeService.update();
    }

    @Interval(PUSH_CHECK_INTERVAL)
    async triggerRecommendationPush(): Promise<void> {
        try {
            const rooms = await this.roomService.roomsForRecommendation();
            for (const room of rooms) {
                await this.pushService.sendRecommendationPush(room);
            }
        } catch (e) {
            Logger.error(e);
        }
    }
}
