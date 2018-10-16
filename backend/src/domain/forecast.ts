export class Forecast {
    timestamp: number;
    occupancy: number;
    constructor(timestamp: number, occupancy?: number){
        this.occupancy = Math.random();
        this.timestamp = timestamp;
    }
}