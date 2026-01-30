export class PlayerSlot {
    public seat: number;
    public playerId: string;
    public connectionId: string;
    public name: string;

    constructor(seat: number, playerId: string, connectionId: string, name: string) {
        this.seat = seat;
        this.playerId = playerId;
        this.connectionId = connectionId;
        this.name = name;
    }
}