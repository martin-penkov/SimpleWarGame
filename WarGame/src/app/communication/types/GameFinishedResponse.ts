import { WinnerSeat } from "../../app/data/WinnerSeat";

export type GameFinishedResponse = {
    gameInstanceId: string;
    winnerSeat: WinnerSeat;
};