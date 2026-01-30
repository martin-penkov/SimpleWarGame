import { EventBus } from "../EventBus";
import { GameEvent } from "../GameEvent";
import { GameModel } from "../GameModel";

export abstract class AbstractController<View> {
    protected view: View;
    protected eventBus: EventBus<GameEvent>;
    protected gameModel: GameModel;

    constructor(view: View, gameModel: GameModel, eventBus: EventBus<GameEvent>) {
        this.view = view;
        this.gameModel = gameModel;
        this.eventBus = eventBus;
    }
}
