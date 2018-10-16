import { Injectable } from '@nestjs/common';
import { Room } from './domain/room';
import { RoomType } from './domain/roomtype.enum';

@Injectable()
export class RoomService {
    rooms(): Array<Room> {
        return [new Room('123'), new Room('456')];
    }
    room(roomId: string) {
        const history = [];
        const now = Date.now();
        for (let i = -(50 * 18000000); i < 0; i += 18000000) {
            history.push({ timestamp: now + i, occupancy: Math.random() });
        }
        return {
            id: roomId,
            name: 'Raum der Stille',
            type: RoomType.AREA,
            history,
            averageWaitingTime: 124,
            averageOccupancy: 0.475,
        };
    }
}
