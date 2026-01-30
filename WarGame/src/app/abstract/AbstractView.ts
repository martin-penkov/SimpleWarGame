import { Container } from "pixi.js";
import { GameAssets } from "../../assets/GameAssets";

export abstract class AbstractView extends Container {
    protected assets: GameAssets;

    constructor(assets: GameAssets) {
        super();
        this.assets = assets;
    }

    public resize(width: number, height: number) {
        this.position.set(width * 0.5, height * 0.5);
    }
}
