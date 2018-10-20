import { Injectable, Logger } from '@nestjs/common';
import { AWSResponse } from './domain/awsresponse';
import * as request from 'request';
import { RoomService } from './room.service';
import * as moment from 'moment';
import { Filling } from './domain/filling';

const DATE_PATTERN = 'YYYY-MM-DD HH:mm:ss';
@Injectable()
export class AWSBeService {
    constructor(private readonly roomService: RoomService) {
    }

    private static KNOWN_ROOMS = ['sitzecke', 'R5-119'];
    private static BE_URL = 'https://env-data-api.mms-project-aws4iot.aws.t-systems-mms.com/final/kitchenDataByRoom?room=';

    update(): void {
        AWSBeService.KNOWN_ROOMS.forEach(roomId => {
            Logger.log(`Fetch data from: ${AWSBeService.BE_URL}${roomId}`, AWSBeService.name);
            request.get({ url: `${AWSBeService.BE_URL}${roomId}`, json: true }, (error, response, body) => {
                if (error) {
                    Logger.log(error, AWSBeService.name);
                } else {
                    if (response && response.statusCode === 200) {
                        this.processData(body);
                    }
                }
            });
        });
    }

    private processData(data: AWSResponse[]): void {
        if (data && data.map) {
            const fillings = data.map(value => {
                const timestamp = moment.utc(value.timestamp, DATE_PATTERN).valueOf();
                return new Filling(timestamp, Math.min(1.0, value.message.filling));
            });
            if (fillings) {
                this.roomService.updateRoom(data[0].location, fillings);
            }
        }
    }
}
