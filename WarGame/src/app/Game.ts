import { AssetsConfig } from "../assets/AssetsConfig";
import { ICommunicator } from "./communication/ICommunicator";
import { CreationEngine } from "../engine/engine";
import { JoinResponse } from "./communication/types/JoinResponse";
import { AbstractView } from "./abstract/AbstractView";
import { EventBus } from "./EventBus";
import { GameAssets } from "../assets/GameAssets";
import { GameEvent } from "./GameEvent";
import { GameModel } from "./GameModel";
import { MainSceneFactory } from "./MainSceneFactory";
import { IComponentFactory } from "./abstract/IComponentFactory";
import { MainScreen } from "./screens/MainScreen";
import { LoadScreen } from "./screens/LoadScreen";
import { NameScreen } from "./screens/NameScreen";

export class Game {
    protected eventBus: EventBus<GameEvent>;
    protected assets: GameAssets;
    protected assetsLoaded: boolean = false;
    protected assetsPromise?: Promise<void>;
    protected gameModel?: GameModel;
    protected createdViews: AbstractView[];
    protected communicator: ICommunicator;
    protected lastOrientation: string = "";
    protected playerName: string = "Player";

    protected pixiApp: CreationEngine;

    constructor(communicator: ICommunicator, pixiApp: CreationEngine, eventBus: EventBus<GameEvent>) {
        this.eventBus = eventBus;
        this.communicator = communicator;
        this.assets = new GameAssets(AssetsConfig);
        this.createdViews = [];
        this.pixiApp = pixiApp;

        this.eventBus.subscribe(GameEvent.Join, (joinData) => this.handleSuccessfullyJoined(joinData as JoinResponse | undefined), this);
        this.init();
    }

    protected async init(): Promise<void> {
        this.initResizeHandler();

        await this.pixiApp.navigation.showScreen(NameScreen);
        const nameScreen = this.pixiApp.navigation.currentScreen as NameScreen;
        this.playerName = await this.waitForUsername(nameScreen);

        await this.pixiApp.navigation.showScreen(LoadScreen);

        this.assetsPromise = this.assets.load().then(() => {
            this.assetsLoaded = true;
        });

        try {
            await this.joinGame();
        } catch (e) {
            console.error("Failed to connect to game", e);
            this.eventBus.dispatch(GameEvent.CommunicationError);
            return;
        }

        await this.assetsPromise;
    }

    protected async joinGame(): Promise<void> {
        const name = this.playerName && this.playerName.trim().length > 0 ? this.playerName.trim() : "Player";
        await this.communicator.start(name);
    }

    protected handleSuccessfullyJoined(joinData?: JoinResponse): void {
        if (!joinData) {
            console.warn("Join event received without payload");
            return;
        }

        if (this.assetsLoaded) {
            this.finishLoadingStep(joinData);
        } else if (this.assetsPromise) {
            this.assetsPromise
                .then(() => this.finishLoadingStep(joinData))
                .catch((err) => {
                    console.error("Failed to finalize join after assets load", err);
                    this.eventBus.dispatch(GameEvent.CommunicationError);
                });
        }
    }

    protected async finishLoadingStep(joinData: JoinResponse): Promise<void> {
        this.gameModel = new GameModel(joinData);
        await this.pixiApp.navigation.showScreen(MainScreen);
        if (this.assetsLoaded && this.gameModel) {
            this.initComponents();
            if (joinData.isWaitingForOpponent) {
                this.eventBus.dispatch(GameEvent.AwaitingOpponent, joinData);
            } else {
                this.eventBus.dispatch(GameEvent.GameStarted, joinData);
            }
        }
    }

    protected async waitForUsername(nameScreen: NameScreen): Promise<string> {
        return new Promise<string>((resolve) => {
            nameScreen.focusInput();
            nameScreen.setOnSubmit((username: string) => {
                resolve(username.length > 0 ? username : "Player");
                nameScreen.destroy();
            });
        });
    }

    protected initResizeHandler(): void {
        window.addEventListener("resize", this.handleResize.bind(this));
        this.handleResize();
    }

    protected handleResize(): void {
        this.pixiApp.resizeTo = window;
        this.pixiApp.resize();
    }

    protected initComponents(): void {
        if (this.assetsLoaded && this.gameModel) {
            this.initComponent(new MainSceneFactory(), this.gameModel);
        }
    }

    protected initComponent(factory: IComponentFactory, model: GameModel): void {
        const component = factory.create(this.eventBus, model, this.assets);
        const target = this.pixiApp.navigation.currentScreen ?? this.pixiApp.stage;
        const centerX = this.pixiApp.renderer.width * 0.5;
        const centerY = this.pixiApp.renderer.height * 0.5;

        if (component.view) {
            this.createdViews.push(target.addChild(component.view));
            component.view.position.set(centerX, centerY);
        }
    }
}