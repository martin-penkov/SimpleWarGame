import { Assets, Sprite, Texture } from "pixi.js";

export type GameAssetConfig = {
    name: string;
    type: "image";
    path: string;
};

export class GameAssets {
    protected assets: GameAssetConfig[];
    protected loadedAssets: { [name: string]: string | string[] };
    constructor(assets: GameAssetConfig[]) {
        this.assets = assets;
        this.loadedAssets = {};
    }

    public async load(): Promise<void> {
        const loadTasks: Promise<void>[] = this.assets.map((asset) =>
            Assets.load({ src: asset.path, alias: asset.name }).then(() => {
                this.loadedAssets[asset.name] = asset.name;
            }),
        );

        await Promise.all(loadTasks);
    }

    public getSprite(assetName: string, frame = 0): Sprite {
        return new Sprite(this.getTexture(assetName, frame));
    }

    public getTexture(assetName: string, frame = 0): Texture {
        if (Array.isArray(this.loadedAssets[assetName])) {
            return Texture.from(this.loadedAssets[assetName][frame]);
        } else {
            return Texture.from(this.loadedAssets[assetName]);
        }
    }
}
