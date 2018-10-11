import { RoomType } from './roomtype.enum';
import { RoomState } from './roomstate.enum';
import { Forecast } from './forecast';

export class Room {
    id: string;
    name: string;
    status: RoomState;
    type: RoomType;
    forecast: Array<Forecast> = [];

    constructor(id: string){
        this.id = id;
        this.name = 'Raum der Stille';
        this.status = RoomState.SEMIFULL;
        this.type = RoomType.AREA;
        this.forecast.push(new Forecast());
    }

}