export class Room {
    public favorite: boolean;
    public status: string;

    constructor(
        public id: string,
    ) {
        this.favorite = false;
        this.status = 'empty';
     }
}
