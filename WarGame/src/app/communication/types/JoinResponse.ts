import { PlayerSlot } from "../../app/data/PlayerSlot";

export type JoinResponse = {
    gameInstanceId: string;
    player1DeckCount: number;
    player2DeckCount: number;
    player1Name: string;
    player2Name: string;
    currentRoundProgress: number;
    slot: PlayerSlot;
    isWaitingForOpponent: boolean;
    isResume: boolean;
    startedNow: boolean;
};