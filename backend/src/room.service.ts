import { Injectable } from '@nestjs/common';
import { Room } from './domain/room';

@Injectable()
export class RoomService {
  rooms(): Array<Room> {
    return [new Room('123'), new Room('456')];
  }
  room(roomId: string){
    return {
      name: 'Raum der Stille',
      history: [{ timestamp: new Date().getTime() - 40000, occupancy: 0.475 }],
      averageWaitingTime: 124,
      averageOccupancy: 0.475,
     };
  }
}
