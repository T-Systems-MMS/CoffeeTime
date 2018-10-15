export class Room {
    public favorite: boolean;
    public status: string;
    public type: string;
    public name: string;
    public averageOccupancy: number;
    public averageWaitingTime: number;

    constructor(
        public id: string,
    ) {
        this.favorite = false;
        this.status = 'empty';
     }
}
