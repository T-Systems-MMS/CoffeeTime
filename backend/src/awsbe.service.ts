import { Injectable, Logger } from '@nestjs/common';
import { AWSResponse } from 'domain/awsresponse';
import * as request from 'request';
import { Filling } from 'domain/filling';
import { StorageService } from 'storage.service';

@Injectable()
export class AWSBeService {
  constructor(private readonly storage: StorageService){
  }

  private static KNOWN_ROOMS = ['sitzecke', 'R5-119'];
  private static BE_URL = 'https://env-data-api.mms-project-aws4iot.aws.t-systems-mms.com/final/kitchenDataByRoom?room=';

  update(): void {
    AWSBeService.KNOWN_ROOMS.forEach(roomId => {
      this.callBe(roomId);
    });
  }

  private callBe(roomId: string): void {
    Logger.log(`Calling: ${roomId}`);
    request.get({url: `${AWSBeService.BE_URL}${roomId}`, json: true}, (error, response, body) => {
      this.processData(body);
    });
  }

  private processData(data: AWSResponse[]): void{
    const fillings = data.map(value => new Filling(value.timestamp, value.message.filling));
    if (fillings){
      this.storage.updateHistory(data[0].location, fillings);
    }
  }
}
