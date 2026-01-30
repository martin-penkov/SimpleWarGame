export type GameStartedResponse = {
    gameInstanceId: string;
    player1DeckCount: number;
    player2DeckCount: number;
    player1Name: string;
    player2Name: string;
    currentRoundProgress: number;
};