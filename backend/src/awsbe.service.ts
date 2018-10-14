import { Injectable, Logger } from '@nestjs/common';
import { AWSResponse } from 'domain/awsresponse';
import * as request from 'request';
import { Filling } from 'domain/filling';
import { RoomService } from 'room.service';

@Injectable()
export class AWSBeService {
  constructor(private readonly roomService: RoomService){
  }

  private static KNOWN_ROOMS = ['sitzecke', 'R5-119'];
  private static BE_URL = 'https://env-data-api.mms-project-aws4iot.aws.t-systems-mms.com/final/kitchenDataByRoom?room=';

  update(): void {
    AWSBeService.KNOWN_ROOMS.forEach(roomId => {
      this.callBe(roomId);
    });
  }

  private callBe(roomId: string): void {
    request.get({url: `${AWSBeService.BE_URL}${roomId}`, json: true}, (error, response, body) => {
      if (error){
        Logger.log(error);
      } else {
        if (response && response.statusCode === 200){
          this.processData(body);
        }
      }
    });
  }

  private processData(data: AWSResponse[]): void{
    if (data && data.map) {
      const fillings = data.map(value => new Filling(value.timestamp, Math.min(1.0, value.message.filling)));
      if (fillings){
        this.roomService.updateRoom(data[0].location, fillings);
      }
    }
  }
}
