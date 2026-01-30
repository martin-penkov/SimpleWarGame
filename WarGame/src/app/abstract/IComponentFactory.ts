import { EventBus } from "../EventBus";
import { GameAssets } from "../../assets/GameAssets";
import { GameEvent } from "../GameEvent";
import { GameModel } from "../GameModel";
import { Component } from "./Component";

export interface IComponentFactory {
    create(eventBus: EventBus<GameEvent>, gameModel: GameModel, assets: GameAssets): Component;
}
