export class Room {
    public favorite: boolean;
    public status: string;
    public type: string;
    public name: string;
    public averageOccupancy: number;
    public averageWaitingTime: number;
    public forecast?: Array<any>;
    public history?: Array<any>;
    public push?: { ifFree: boolean, recommendations: boolean };
    public dataOutdated?: boolean;

    constructor(
        public id: string,
    ) {
        this.favorite = false;
        this.status = 'empty';
    }
}
