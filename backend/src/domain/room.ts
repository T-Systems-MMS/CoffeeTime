import { RoomType } from './roomtype.enum';
import { RoomState } from './roomstate.enum';
import { Forecast } from './forecast';

export class Room {
    id: string;
    name: string;
    status: RoomState;
    type: RoomType;
    forecast: Array<Forecast> = [];

    constructor(id: string) {
        this.id = id;
        this.name = 'Raum der Stille';
        this.status = RoomState.SEMIFULL;
        this.type = RoomType.AREA;
        for (let i = -(40 * 18000000); i < 10 * 18000000; i += 18000000) {
            this.forecast.push(new Forecast(Date.now() + i));
        }
    }

}