import { Component } from "./abstract/Component";
import { IComponentFactory } from "./abstract/IComponentFactory";
import { MainViewController } from "./controllers/MainViewController";
import { EventBus } from "./EventBus";
import { GameAssets } from "../assets/GameAssets";
import { GameEvent } from "./GameEvent";
import { GameModel } from "./GameModel";
import { MainView } from "./views/MainView";

export class MainSceneFactory implements IComponentFactory {
    create(eventBus: EventBus<GameEvent>, gameModel: GameModel, assets: GameAssets): Component {
        const view = new MainView(assets);
        const controller = new MainViewController(view, gameModel, eventBus);

        return {
            controller,
            view,
        };
    }
}