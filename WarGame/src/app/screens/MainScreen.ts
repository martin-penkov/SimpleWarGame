import { Container, Graphics, Sprite, Texture } from "pixi.js";

export class MainScreen extends Container {
    protected background?: Sprite;
    protected contrastFilter?: Graphics;

    constructor() {
        super();
        this.createBackground();
        this.createContrastFilter();
    }

    protected createBackground(): void {
        this.background = new Sprite({
            texture: Texture.from("background"),
        });
        this.background.anchor.set(0.5);
        this.background.scale.set(1.6);
        this.addChildAt(this.background, 0);
    }

    protected createContrastFilter(): void {
        this.contrastFilter = new Graphics();
        this.addChildAt(this.contrastFilter, 1);
    }

    public resize(width: number, height: number): void {
        if (this.background) {
            
            const scaleX = width / this.background.texture.width;
            const scaleY = height / this.background.texture.height;
            const scale = Math.max(scaleX, scaleY);
            this.background.scale.set(scale * 1.6);
            this.background.position.set(width * 0.5, height * 0.5 + 45);
        }

        if (this.contrastFilter) {
            const filterWidth = width;
            const filterHeight = height;
            const filterX = (width - filterWidth) * 0.5;
            const filterY = (height - filterHeight) * 0.5;
            const cornerRadius = 20;

            this.contrastFilter.clear();

            this.contrastFilter.roundRect(
                filterX,
                filterY,
                filterWidth * 2,
                filterHeight * 2,
                cornerRadius * 0.3
            ).fill({ color: 0x000000, alpha: 0.7 });
        }

        this.children.forEach((child: Container) => {
            const maybeResize = (child as { resize?: (w: number, h: number) => void }).resize;
            if (maybeResize) {
                maybeResize.call(child, width, height);
            }
        });
    }
}