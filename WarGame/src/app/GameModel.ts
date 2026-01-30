import { JoinResponse } from "./communication/types/JoinResponse";
import { RoundRevealedPayload } from "./communication/types/RoundRevealedPayload";
import { PlayerSlot } from "./data/PlayerSlot";

export class GameModel {
    playerSlot: PlayerSlot;
    roundProgress: number;
    isWaitingForOpponent: boolean;
    isResume: boolean;
    startedNow: boolean;
    gameInstanceId: string;
    player1DeckCount: number;
    player2DeckCount: number;
    playerName!: string;
    opponentName!: string;
    currentRoundProgress: number;

    constructor(joinData: JoinResponse) {
        this.playerSlot = joinData.slot;
        this.roundProgress = 0;
        this.isWaitingForOpponent = joinData.isWaitingForOpponent;
        this.isResume = joinData.isResume;
        this.startedNow = joinData.startedNow;
        this.gameInstanceId = joinData.gameInstanceId;
        this.player1DeckCount = joinData.player1DeckCount;
        this.player2DeckCount = joinData.player2DeckCount;
        this.updatePlayerNames(joinData.player1Name, joinData.player2Name);
        this.currentRoundProgress = joinData.currentRoundProgress;
    }

    public update(payload: RoundRevealedPayload): void {
        this.player1DeckCount = payload.player1DeckCount;
        this.player2DeckCount = payload.player2DeckCount;
    }

    public updatePlayerNames(player1Name: string, player2Name: string): void {
        if(this.playerSlot.seat === 1){
            this.playerName = player1Name;
            this.opponentName = player2Name;
        } else {
            this.playerName = player2Name;
            this.opponentName = player1Name;
        }
    }
}
