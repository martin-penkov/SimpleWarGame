import { GameFinishedResponse } from "../communication/types/GameFinishedResponse";
import { GameStartedResponse } from "../communication/types/GameStartedResponse";
import { PlayerReadyResponse } from "../communication/types/PlayerReadyResponse";
import { RoundRevealedPayload } from "../communication/types/RoundRevealedPayload";
import { AbstractController } from "../abstract/AbstractController";
import { WinnerSeat } from "../data/WinnerSeat";
import { EventBus } from "../EventBus";
import { GameEvent } from "../GameEvent";
import { GameModel } from "../GameModel";
import { translateCardToAsset } from "../utils/translateCardToAsset";
import { MainView } from "../views/MainView";


export class MainViewController extends AbstractController<MainView> {

    public constructor(view: MainView, gameModel: GameModel, eventBus: EventBus<GameEvent>) {
        super(view, gameModel, eventBus);

        this.eventBus.subscribe(GameEvent.CommunicationError, this.handleErrorReceived, this);
        this.eventBus.subscribe(GameEvent.AwaitingOpponent, this.handleAwaitingOpponent, this);
        this.eventBus.subscribe(GameEvent.GameStarted, this.handleGameStarted, this);
        this.eventBus.subscribe(GameEvent.Resume, this.handleResume, this);
        this.eventBus.subscribe(GameEvent.RoundRevealed, this.handleRoundRevealed, this);
        this.eventBus.subscribe(GameEvent.GameFinished, this.handleGameFinished, this);
        this.eventBus.subscribe(GameEvent.OpponentLeft, this.handleOpponentLeft, this);
        this.eventBus.subscribe(GameEvent.PlayerReady, this.handlePlayerReady, this);

        this.view.setRevealHandler(() => this.eventBus.dispatch(GameEvent.Reveal));
        this.view.setPlayAgainHandler(() => this.eventBus.dispatch(GameEvent.PlayAgain));
    }

    protected handleErrorReceived(): void {}

    protected handleAwaitingOpponent(): void {
        this.view.showAwaitingOpponent();
    }

    protected handleGameStarted(payload: GameStartedResponse): void {
        this.gameModel.updatePlayerNames(payload.player1Name, payload.player2Name);
        this.view.showGameStarted(this.gameModel.playerName, this.gameModel.opponentName, this.gameModel.playerSlot.seat);
    }

    protected handleResume(): void {}

    protected handleRoundRevealed(payload: RoundRevealedPayload): void {
        const isTie = payload.winnerSeat === WinnerSeat.Tie;
        const isCurrentPlayerWinner = payload.winnerSeat === this.gameModel.playerSlot.seat;
        const playerCard = this.gameModel.playerSlot.seat === 1 ? payload.player1Card : payload.player2Card;
        const opponentCard = this.gameModel.playerSlot.seat === 1 ? payload.player2Card : payload.player1Card;
        const playerCardCount = this.gameModel.playerSlot.seat === 1 ? payload.player1DeckCount : payload.player2DeckCount;
        const opponentCardCount = this.gameModel.playerSlot.seat === 1 ? payload.player2DeckCount : payload.player1DeckCount;

        this.gameModel.update(payload);
        this.view.revealRoundWinner(translateCardToAsset(playerCard), translateCardToAsset(opponentCard), isCurrentPlayerWinner, isTie, playerCardCount, opponentCardCount, payload.winnerSeat);
    }

    protected handleGameFinished(payload: GameFinishedResponse): void {
        const isTie = payload.winnerSeat === WinnerSeat.Tie;
        const isWinner = payload.winnerSeat === this.gameModel.playerSlot.seat;
        this.view.showGameFinished(isWinner, isTie);
    }

    protected handleOpponentLeft(): void {}

    protected handlePlayerReady(data: PlayerReadyResponse): void {
        if(this.gameModel.playerSlot.seat !== data.playerSeat){
            this.view.showOpponentReady();
        }
    }
}
