import { Container, Graphics, Text } from "pixi.js";
import { Label } from "../ui/Label";

export class NameScreen extends Container {
    private titleText: Text;
    private inputContainer: Container;
    private inputField: HTMLInputElement;
    private submitButton: Container;
    private onSubmit?: (username: string) => void;

    constructor() {
        super();

        this.titleText = new Label({
            text: "Enter your username",
            style: {
                fill: 0xffffff,
                fontSize: 36,
                fontWeight: "bold",
            },
        });
        this.addChild(this.titleText);

        this.inputContainer = new Container();
        const inputBg = new Graphics();
        inputBg.roundRect(-150, -25, 300, 50, 10).fill({ color: 0xffffff, alpha: 0.9 });
        inputBg.roundRect(-150, -25, 300, 50, 10).stroke({ color: 0xcccccc, width: 2 });
        this.inputContainer.addChild(inputBg);
        this.addChild(this.inputContainer);

        this.inputField = document.createElement("input");
        this.inputField.type = "text";
        this.inputField.placeholder = "Username";
        this.inputField.maxLength = 20;
        this.inputField.style.position = "absolute";
        this.inputField.style.width = "300px";
        this.inputField.style.height = "50px";
        this.inputField.style.padding = "0 15px";
        this.inputField.style.fontSize = "24px";
        this.inputField.style.fontFamily = "Arial Rounded MT Bold, Arial, sans-serif";
        this.inputField.style.textAlign = "center";
        this.inputField.style.border = "none";
        this.inputField.style.borderRadius = "10px";
        this.inputField.style.outline = "none";
        this.inputField.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
        this.inputField.style.color = "#000000";
        this.inputField.style.boxSizing = "border-box";

        this.inputField.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                this.handleSubmit();
            }
        });

        this.submitButton = new Container();
        const buttonBg = new Graphics();
        buttonBg.roundRect(-75, -25, 150, 50, 10).fill({ color: 0x013220 });
        buttonBg.roundRect(-75, -25, 150, 50, 10).stroke({ color: 0x013220, width: 2 });
        this.submitButton.addChild(buttonBg);

        const buttonLabel = new Label({
            text: "Enter",
            style: {
                fill: 0xffffff,
                fontSize: 24,
                fontWeight: "bold",
            },
        });
        this.submitButton.addChild(buttonLabel);

        this.submitButton.eventMode = "static";
        this.submitButton.cursor = "pointer";
        this.submitButton.on("pointerdown", () => {
            buttonBg.clear();
            buttonBg.roundRect(-75, -25, 150, 50, 10).fill({ color: 0x90EE90 });
            buttonBg.roundRect(-75, -25, 150, 50, 10).stroke({ color: 0x90EE90, width: 2 });
        });
        this.submitButton.on("pointerup", () => {
            buttonBg.clear();
            buttonBg.roundRect(-75, -25, 150, 50, 10).fill({ color: 0x013220 });
            buttonBg.roundRect(-75, -25, 150, 50, 10).stroke({ color: 0x013220, width: 2 });
            this.handleSubmit();
        });

        this.addChild(this.submitButton);

        const pixiContainer = document.getElementById("pixi-container");
        if (pixiContainer) {
            pixiContainer.appendChild(this.inputField);
        }
    }

    public setOnSubmit(callback: (username: string) => void): void {
        this.onSubmit = callback;
    }

    private handleSubmit(): void {
        const username = this.inputField.value.trim();
        if (username.length > 0 && this.onSubmit) {
            this.onSubmit(username);
        }
    }

    public focusInput(): void {
        setTimeout(() => {
            this.inputField.focus();
        }, 100);
    }

    public resize(width: number, height: number): void {
        this.titleText.position.set(width * 0.5, height * 0.5 - 100);
        this.inputContainer.position.set(width * 0.5, height * 0.5);
        this.submitButton.position.set(width * 0.5, height * 0.5 + 80);

        const pixiContainer = document.getElementById("pixi-container");
        if (pixiContainer) {
            const rect = pixiContainer.getBoundingClientRect();
            const canvas = pixiContainer.querySelector("canvas");
            if (canvas) {
                const canvasRect = canvas.getBoundingClientRect();
                const scaleX = canvasRect.width / width;
                const scaleY = canvasRect.height / height;
                
                this.inputField.style.left = `${rect.left + (width * 0.5 - 150) * scaleX}px`;
                this.inputField.style.top = `${rect.top + (height * 0.5 - 25) * scaleY}px`;
                this.inputField.style.transform = `scale(${scaleX}, ${scaleY})`;
                this.inputField.style.transformOrigin = "top left";
            }
        }
    }

    public destroy(): void {
        if (this.inputField.parentNode) {
            this.inputField.parentNode.removeChild(this.inputField);
        }
        super.destroy();
    }
}

