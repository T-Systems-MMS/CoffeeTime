import { Injectable } from '@nestjs/common';
import { Room } from './domain/room';

@Injectable()
export class AppService {
  root(): Array<Room> {
    return [new Room('123'), new Room('456')];
  }
}
