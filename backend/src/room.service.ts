import { Injectable } from '@nestjs/common';
import { Room } from './domain/room';

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
            name: 'Raum der Stille',
            history: history,
            averageWaitingTime: 124,
            averageOccupancy: 0.475,
        };
    }
}
