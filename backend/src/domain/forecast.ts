export class Forecast {
    timestamp: number;
    occupancy: number;
    constructor(){
        this.occupancy = 0.5;
        this.timestamp = new Date(2017, 12, 24).getTime();
    }
}