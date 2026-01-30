import { Card } from "../../app/data/Card";
import { WinnerSeat } from "../../app/data/WinnerSeat";

export type RoundRevealedPayload = {
    gameId: string;
    round: number;
    player1Card: Card;
    player2Card: Card;
    winnerSeat: WinnerSeat;
    player1DeckCount: number;
    player2DeckCount: number;
};

