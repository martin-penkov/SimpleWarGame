/* eslint-disable no-case-declarations */
import { Container, Graphics, Sprite, Text } from "pixi.js";
import { AbstractView } from "../abstract/AbstractView";
import { GameAssets } from "../../assets/GameAssets";
import { Label } from "../ui/Label";
import gsap from "gsap";
import { WinnerSeat } from "../data/WinnerSeat";

export class MainView extends AbstractView  {
    
    protected container: Container;
    protected awaitingGroup?: Container;
    protected gameGroup?: Container;
    protected revealButton?: Container;
    protected onReveal?: () => void;
    protected tableLeft?: Container;
    protected tableRight?: Container;
    protected statusLabel?: Label;
    protected nameLabel?: Text;
    protected opponentNameLabel?: Text;
    protected currentPlayerSlot: number = 0;

    protected playerCardCount: number = 0;
    protected opponentCardCount: number = 0;
    protected lastWinningSeat: WinnerSeat = WinnerSeat.Tie;
    protected playerName: string = "";
    protected opponentName: string = "";

    protected playAgainButton?: Container;
    protected onPlayAgain?: () => void;
    protected playerDeck?: Container;
    protected opponentDeck?: Container;

    protected hiddenLeftCard?: Sprite;
    protected hiddenRightCard?: Sprite;
    protected lastLeftCard?: Sprite;
    protected lastRightCard?: Sprite;

    protected areLastWinningCardsAnimated: boolean = false;

    constructor(assets: GameAssets) {
        super(assets);
        this.container = new Container();
        this.addChild(this.container);
    }

    public setRevealHandler(handler: () => void): void {
        this.onReveal = handler;
    }

    public setPlayAgainHandler(handler: () => void): void {
        this.onPlayAgain = handler;
    }

    public async showGameFinished(isWinner: boolean, isTie: boolean): Promise<void> {
        await this.animateLastWinningCards();

        if(this.hiddenLeftCard){
            this.hiddenLeftCard.destroy();
            this.hiddenLeftCard = undefined;
        }

        if(this.hiddenRightCard){
            this.hiddenRightCard.destroy();
            this.hiddenRightCard = undefined;
        }

        if (this.tableLeft && this.tableLeft.parent) {
            this.tableLeft.removeChildren();
            this.tableLeft.parent.removeChild(this.tableLeft);
        }
        if (this.tableRight && this.tableRight.parent) {
            this.tableRight.removeChildren();
            this.tableRight.parent.removeChild(this.tableRight);
        }
        this.tableLeft = undefined;
        this.tableRight = undefined;

        if (this.revealButton) {
            this.revealButton.visible = false;
        }

        const result: "win" | "lose" | "tie" = isTie ? "tie" : isWinner ? "win" : "lose";
        this.showStatus(result);
        if (this.statusLabel) {
            this.statusLabel.style.fill = isTie ? 0xf1c40f : isWinner ? 0x2ecc71 : 0xe74c3c;
            this.statusLabel.position.set(0, -120);
        }

        if (!this.playAgainButton) {
            this.playAgainButton = this.createPlayAgainButton();
            this.container.addChild(this.playAgainButton);
        }
        this.playAgainButton.visible = true;
        this.playAgainButton.position.set(0, 0);
        this.enableRevealButton();
    }
    
    public showAwaitingOpponent(): void {
        this.clearState();

        this.awaitingGroup = new Container();
        this.container.addChild(this.awaitingGroup);

        const label = new Text({
            text: "Waiting for an opponent...",
            style: {
                fill: 0xffffff,
                fontSize: 32,
                fontWeight: "bold",
            },
        });

        label.anchor.set(0.5);
        label.position.set(0, -80);
        this.awaitingGroup.addChild(label);
    }

    public showGameStarted(playerName: string, opponentName = "Opponent", currentPlayerSlot: number): void {
        this.clearState();

        if (!this.revealButton) {
            this.createRevealButton();
        }

        this.playerName = playerName;
        this.opponentName = opponentName;
        this.currentPlayerSlot = currentPlayerSlot;
        this.gameGroup = new Container();
        this.container.addChild(this.gameGroup);

        const middleOutline1 = this.makeCardOutline();
        const middleOutline2 = this.makeCardOutline();
        middleOutline1.position.set(-50, -40);
        middleOutline2.position.set(50, -40);
        this.tableLeft = middleOutline1;
        this.tableRight = middleOutline2;
        this.gameGroup.addChild(middleOutline1, middleOutline2);

        // Deck visualizations
        const oppDeck = this.makeDeckVisualization();
        oppDeck.position.set(0, -200);
        this.gameGroup.addChild(oppDeck);
        this.opponentDeck = oppDeck;

        const playerDeck = this.makeDeckVisualization();
        playerDeck.position.set(0, 220 - playerDeck.height);
        this.gameGroup.addChild(playerDeck);
        this.playerDeck = playerDeck;

        const opponentNameText = this.opponentCardCount > 0 ? opponentName + " (" + this.opponentCardCount + ")" : opponentName;
        this.opponentNameLabel = new Text({
            text: opponentNameText,
            style: {
                fill: 0xffffff,
                fontSize: 24,
                fontWeight: "bold",
            },
        });
        this.opponentNameLabel.anchor.set(0.5);
        this.opponentNameLabel.position.set(0, -285);
        this.gameGroup.addChild(this.opponentNameLabel);

        const nametext = this.playerCardCount > 0 ? playerName + " (" + this.playerCardCount + ")" : playerName;
        this.nameLabel = new Text({
            text: nametext,
            style: {
                fill: 0xffffff,
                fontSize: 28,
                fontWeight: "bold",
            },
        });
        this.nameLabel.anchor.set(0.5);
        this.nameLabel.position.set(0, 210);
        this.gameGroup.addChild(this.nameLabel);
        if (this.revealButton) {
            this.revealButton.visible = true;
        }
        this.gameGroup.scale.set(1.6);
    }

    public async showOpponentReady(): Promise<void> {
        const tableRight = this.tableRight;
        const opponentDeck = this.opponentDeck;
        
        if (!tableRight || !opponentDeck || !this.gameGroup) {
            return;
        }

        await this.animateLastWinningCards();

        tableRight.removeChildren();

        this.hiddenRightCard = this.assets.getSprite("hidden");
        this.hiddenRightCard.anchor.set(0.5);
        this.hiddenRightCard.scale.set(1.55);
        
        const deckWorldPos = opponentDeck.position.clone();
        const tableWorldPos = tableRight.position.clone();
        
        this.gameGroup.addChild(this.hiddenRightCard);
        this.hiddenRightCard.position.set(deckWorldPos.x, deckWorldPos.y);
        
        gsap.to(this.hiddenRightCard, {
            pixi: {
                x: tableWorldPos.x,
                y: tableWorldPos.y,
            },
            duration: 0.6,
            ease: "power2.out"
        });
    }

    public async showHiddenOnReveal(): Promise<void> {
        const tableLeft = this.tableLeft;
        const playerDeck = this.playerDeck;
        
        if (!tableLeft || !playerDeck || !this.gameGroup) {
            return;
        }

        this.disableRevealButton();
        await this.animateLastWinningCards();

        tableLeft.removeChildren();

        this.hiddenLeftCard = this.assets.getSprite("hidden");
        this.hiddenLeftCard.anchor.set(0.5);
        this.hiddenLeftCard.scale.set(1);
        
        const deckWorldPos = playerDeck.position.clone();
        const tableWorldPos = tableLeft.position.clone();
        
        this.gameGroup.addChild(this.hiddenLeftCard);
        this.hiddenLeftCard.position.set(deckWorldPos.x, deckWorldPos.y);
        
        gsap.to(this.hiddenLeftCard, {
            pixi: {
                x: tableWorldPos.x,
                y: tableWorldPos.y,
                scale: 1.55,
            },
            duration: 0.6,
            ease: "power2.out"
        });
    }

    public async revealRoundWinner(leftCard: string, rightCard: string, isCurrentPlayerWinner: boolean, isTie: boolean, playerCardCount: number, opponentCardCount: number, winnerSeat: WinnerSeat): Promise<void> {
        const tableLeft = this.tableLeft;
        const tableRight = this.tableRight;
        const playerDeck = this.playerDeck;
        const opponentDeck = this.opponentDeck;
        
        if (!tableLeft || !tableRight || !playerDeck || !opponentDeck || !this.gameGroup) {
            return;
        }

        tableRight.removeChildren();

        const opponentDeckWorldPos = opponentDeck.position.clone();
        const tableRightWorldPos = tableRight.position.clone();

        if(!this.hiddenRightCard){
            this.hiddenRightCard = this.assets.getSprite("hidden");
            this.hiddenRightCard.anchor.set(0.5);
            this.hiddenRightCard.scale.set(1);
            
            this.gameGroup.addChild(this.hiddenRightCard);
            this.hiddenRightCard.position.set(opponentDeckWorldPos.x, opponentDeckWorldPos.y);
            
            await gsap.to(this.hiddenRightCard, {
                pixi: {
                    x: tableRightWorldPos.x,
                    y: tableRightWorldPos.y,
                    scale: 1.55,
                },
                duration: 0.6,
                ease: "power2.out"
            });
        }

        await new Promise((resolve) => setTimeout(resolve, 400));

        tableLeft.removeChildren();
        tableRight.removeChildren();

        const leftCardSprite = this.assets.getSprite(leftCard);
        const rightCardSprite = this.assets.getSprite(rightCard);

        leftCardSprite.scale.set(1.55);
        rightCardSprite.scale.set(1.55);
        leftCardSprite.anchor.set(0.5);
        rightCardSprite.anchor.set(0.5);

        const tableLeftWorldPos = tableLeft.position.clone();

        leftCardSprite.scale.x = 0;
        rightCardSprite.scale.x = 0;
        this.gameGroup.addChild(leftCardSprite, rightCardSprite);
        leftCardSprite.position.set(tableLeftWorldPos.x, tableLeftWorldPos.y);
        rightCardSprite.position.set(tableRightWorldPos.x, tableRightWorldPos.y);

        await Promise.all([
            gsap.to(this.hiddenRightCard, {
                pixi: {
                    scaleX: 0,
                },
                duration: 0.6,
                ease: "power2.out",
                onComplete: () => {
                    this.hiddenRightCard!.destroy();
                    this.hiddenRightCard = undefined;
                }
            }),
            gsap.to(this.hiddenLeftCard!, {
                pixi: {
                    scaleX: 0,
                },
                duration: 0.6,
                ease: "power2.out",
                onComplete: () => {
                    this.hiddenLeftCard!.destroy();
                    this.hiddenLeftCard = undefined;
                }
            })
        ]);

        await Promise.all([
                gsap.to(leftCardSprite, {
                    pixi: {
                        scaleX: 1.55,
                    },
                    duration: 0.6,
                    direction: "reverse",
                    ease: "power2.out"
                }),
                gsap.to(rightCardSprite, {
                    pixi: {
                        scaleX: 1.55,
                    },
                    duration: 0.6,
                    direction: "reverse",
                    ease: "power2.out"
                }),
        ]);

        this.playerCardCount = playerCardCount;
        this.opponentCardCount = opponentCardCount;
        this.lastWinningSeat = winnerSeat;
        this.lastLeftCard = leftCardSprite;
        this.lastRightCard = rightCardSprite;

        this.showStatus(isTie ? "tie" : isCurrentPlayerWinner ? "win" : "lose");

        this.updateCardCounts(playerCardCount, opponentCardCount);

        this.areLastWinningCardsAnimated = false;
        this.enableRevealButton();
        await new Promise((resolve) => setTimeout(resolve, 3500));
        await this.animateLastWinningCards();
    }

    protected makeCardOutline(): Graphics {
        const g = new Graphics();
        g.roundRect(-40, -60, 80, 120, 6).stroke({ color: 0xffffff, width: 3, alpha: 0.6 });
        return g;
    }

    protected makeDeckVisualization(): Container {
        const deck = new Container();
        const cardBottom = this.assets.getSprite("hidden");
        const cardTop = this.assets.getSprite("hidden");
        cardBottom.anchor.set(0.5);
        cardTop.anchor.set(0.5);
        cardBottom.alpha = 0.5;
        deck.addChild(cardBottom, cardTop);
        cardBottom.position.set(-5, -10);

        return deck;
    }

    protected createRevealButton(): void {
        const button = new Container();

        const bg = this.assets.getSprite("button");
        bg.anchor.set(0.5);
        button.addChild(bg);
        bg.scale.set(0.85);

        const label = new Label({
            text: "Reveal",
            style: {
                fill: 0x000000,
                fontSize: 32,
                fontWeight: "bold",
            },
        });
        label.anchor.set(0.5);
        label.position.set(0, -10);
        button.addChild(label);

        button.eventMode = "static";
        button.cursor = "pointer";
        button.visible = false;
        button.on("pointerover", () => {
            bg.scale.set(0.9);
        });
        button.on("pointerout", () => {
            bg.scale.set(0.85);
        });
        button.on("pointerdown", () => {
            bg.scale.set(0.82);
            label.scale.set(0.97);
            label.position.set(0, -6);
        });
        button.on("pointerup", () => {
            bg.scale.set(0.9);
            label.scale.set(1);
            label.position.set(0, -10);
            if (this.onReveal) {
                this.onReveal();
                this.showHiddenOnReveal();
            }
        });

        this.revealButton = button;
        this.revealButton.position.set(340, -this.revealButton.height / 2);
        this.container.addChild(button);
    }

    protected async animateLastWinningCards(): Promise<void> {
        if (!this.lastLeftCard || !this.lastRightCard || !this.playerDeck || !this.opponentDeck) {
            return;
        }

        console.log("attempting to animate last winning cards");

        if(this.areLastWinningCardsAnimated){
            return;
        }
        this.areLastWinningCardsAnimated = true;

        const playerDeckPosition = this.playerDeck.position.clone();
        const opponentDeckPosition = this.opponentDeck.position.clone();

        switch(this.lastWinningSeat) {
            case WinnerSeat.Player1:
                const targetPositionPlayer1 = this.currentPlayerSlot === 1 ? playerDeckPosition : opponentDeckPosition;

                await Promise.all([gsap.to(this.lastLeftCard, {
                    pixi: {
                        positionX: targetPositionPlayer1.x,
                        positionY: targetPositionPlayer1.y,
                        scale: 1,
                        alpha: 0
                    },
                    duration: 0.6,
                    ease: "power2.out"
                }),
                gsap.to(this.lastRightCard, {
                    pixi: {
                        positionX: targetPositionPlayer1.x,
                        positionY: targetPositionPlayer1.y,
                        scale: 1,
                        alpha: 0
                    },
                    duration: 0.6,
                    ease: "power2.out"
                })]);
                break;
            case WinnerSeat.Player2:
                const targetPositionPlayer2 = this.currentPlayerSlot === 1 ? opponentDeckPosition : playerDeckPosition;

                await Promise.all([gsap.to(this.lastLeftCard, {
                    pixi: {
                        positionX: targetPositionPlayer2.x,
                        positionY: targetPositionPlayer2.y,
                    },
                    duration: 0.6,
                    ease: "power2.out",
                    scale: 1,
                    alpha: 0
                }),
                gsap.to(this.lastRightCard, {
                    pixi: {
                        positionX: targetPositionPlayer2.x,
                        positionY: targetPositionPlayer2.y,
                    },
                    duration: 0.6,
                    ease: "power2.out",
                    scale: 1,
                    alpha: 0
                })]);
                break;
            case WinnerSeat.Tie:
                await Promise.all([gsap.to(this.lastLeftCard, {
                    pixi: {
                        positionX: playerDeckPosition.x,
                        positionY: playerDeckPosition.y,
                    },
                    duration: 0.6,
                    ease: "power2.out",
                    scale: 1,
                    alpha: 0
                }),
                gsap.to(this.lastRightCard, {
                    pixi: {
                        positionX: opponentDeckPosition.x,
                        positionY: opponentDeckPosition.y,
                    },
                    duration: 0.6,
                    ease: "power2.out",
                    scale: 1,
                    alpha: 0
                })]);
                break;
        }

        this.lastLeftCard!.destroy();
        this.lastRightCard!.destroy();
        this.lastLeftCard = undefined;
        this.lastRightCard = undefined;
    }

    protected updateCardCounts(playerCardCount: number, opponentCardCount: number): void {
        if(!this.nameLabel || !this.opponentNameLabel){
            return;
        }

        const nameText = playerCardCount > 0 ? this.playerName + " (" + playerCardCount + ")" : this.playerName;
        const opponentNameText = opponentCardCount > 0 ? this.opponentName + " (" + opponentCardCount + ")" : this.opponentName;
        this.nameLabel.text = nameText;
        this.opponentNameLabel.text = opponentNameText;
    }

    protected showStatus(result: "win" | "lose" | "tie"): void {
        if (!this.statusLabel) {
            this.statusLabel = new Label({
                text: "",
                style: {
                    fill: 0xffffff,
                    fontSize: 36,
                    fontWeight: "bold"
                },
            });
            this.statusLabel.anchor.set(0.5);
            this.container.addChild(this.statusLabel);
        }

        switch (result) {
            case "win":
                this.statusLabel.text = "You win";
                break;
            case "lose":
                this.statusLabel.text = "You lose";
                break;
            default:
                this.statusLabel.text = "Tie";
                break;
        }

        this.statusLabel.position.set(310, 75);
    }

    private disableRevealButton(): void {
        if (this.revealButton) {
            this.revealButton.eventMode = "none";
            this.revealButton.cursor = "default";
            this.revealButton.alpha = 0.5;
        }
    }

    private enableRevealButton(): void {
        if (this.revealButton) {
            this.revealButton.eventMode = "static";
            this.revealButton.cursor = "pointer";
            this.revealButton.alpha = 1;
        }
    }

    private clearState(): void {
        if (this.awaitingGroup) {
            this.awaitingGroup.destroy({ children: true });
            this.awaitingGroup = undefined;
        }
        if (this.gameGroup) {
            this.gameGroup.destroy({ children: true });
            this.gameGroup = undefined;
        }
        this.tableLeft = undefined;
        this.tableRight = undefined;
        this.playerDeck = undefined;
        this.opponentDeck = undefined;
    }

    private createPlayAgainButton(): Container {
        const button = new Container();
        const bg = this.assets.getSprite("button");
        bg.anchor.set(0.5);
        bg.scale.set(0.95);
        button.addChild(bg);

        const label = new Label({
            text: "Play again?",
            style: {
                fill: 0x000000,
                fontSize: 32,
                fontWeight: "bold",
            },
        });
        label.anchor.set(0.5);
        label.position.set(0, -10);
        button.addChild(label);

        button.eventMode = "static";
        button.cursor = "pointer";
        button.visible = false;

        button.on("pointerover", () => bg.scale.set(1.0));
        button.on("pointerout", () => bg.scale.set(0.95));
        button.on("pointerdown", () => {
            bg.scale.set(0.92);
            label.position.set(0, -6);
        });
        button.on("pointerup", () => {
            bg.scale.set(1.0);
            label.position.set(0, -10);
            if (this.onPlayAgain) {
                this.onPlayAgain();
            }
            this.resetView();
        });

        return button;
    }

    private resetView(): void {
        if (this.gameGroup) {
            this.gameGroup.destroy({ children: true });
            this.gameGroup = undefined;
        }
        if (this.awaitingGroup) {
            this.awaitingGroup.destroy({ children: true });
            this.awaitingGroup = undefined;
        }
        this.tableLeft = undefined;
        this.tableRight = undefined;
        if (this.statusLabel) {
            this.statusLabel.destroy();
            this.statusLabel = undefined;
        }
        if (this.nameLabel) {
            this.nameLabel.destroy();
            this.nameLabel = undefined;
        }
        if (this.opponentNameLabel) {
            this.opponentNameLabel.destroy();
            this.opponentNameLabel = undefined;
        }
        if (this.revealButton) {
            this.revealButton.visible = false;
        }
        if (this.playAgainButton) {
            this.playAgainButton.visible = false;
        }
    }

    public resize(width: number, height: number) {
        super.resize(width, height);

        this.container.position.set(0, 0);
        if (this.awaitingGroup) {
            this.awaitingGroup.position.set(0, 0);
        }
        if (this.gameGroup) {
            this.gameGroup.position.set(0, 0);
        }
        if (this.revealButton) {
            this.revealButton.position.set(340, -this.revealButton.height / 2);
        }
        if (this.statusLabel) {
            this.statusLabel.position.set(0, 300);
        }
        if (this.playAgainButton) {
            this.playAgainButton.position.set(0, 140);
        }
    }
}
