import { ICommunicator } from "./ICommunicator";
import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { IPlayerOutgoingMessage } from "./types/PlayerOutgoingMessage";
import { PlayerOutgoingMessageType } from "./types/PlayerOutgoingMessageType";
import { GameEvent } from "../GameEvent";
import { EventBus } from "../EventBus";

export class Communicator implements ICommunicator {
    protected eventBus: EventBus<GameEvent>;
    protected backendUrl: string;
    protected connection: HubConnection;
    protected isConnected: boolean = false;
    protected lastPlayerName: string = "Player";

    constructor(backendUrl: string, eventBus: EventBus<GameEvent>) {
        this.backendUrl = backendUrl;
        this.eventBus = eventBus;
        this.connection = new HubConnectionBuilder()
            .withUrl(backendUrl)
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        this.connection.on("Message", (message: string) => {
            this.handleMessageFromServer(JSON.parse(message));
        });

        this.eventBus.subscribe(GameEvent.Reveal, this.reveal, this);
        this.eventBus.subscribe(GameEvent.PlayAgain, this.playAgain, this);
    }

    public handleMessageFromServer(message: IPlayerOutgoingMessage<unknown>): void {
        switch (message.type) {
            case PlayerOutgoingMessageType.Join:
                console.log("Join", message.data);
                this.dispatchJoinIfNotConnected(message);
                this.eventBus.dispatch(GameEvent.AwaitingOpponent);
                break;
            case PlayerOutgoingMessageType.Resume:
                console.log("Resume", message.data);
                this.dispatchJoinIfNotConnected(message);
                this.eventBus.dispatch(GameEvent.GameStarted);
                break;
            case PlayerOutgoingMessageType.GameStarted:
                console.log("Game started", message.data);
                this.eventBus.dispatch(GameEvent.GameStarted, message.data);
                break;
            case PlayerOutgoingMessageType.RoundRevealed:
                console.log("Round revealed", message.data);
                this.eventBus.dispatch(GameEvent.RoundRevealed, message.data);
                break;
            case PlayerOutgoingMessageType.GameFinished:
                console.log("Game finished", message.data);
                this.eventBus.dispatch(GameEvent.GameFinished, message.data);
                break;
            case PlayerOutgoingMessageType.OpponentLeft:
                break;
            case PlayerOutgoingMessageType.PlayerReady:
                console.log("Player ready", message.data);
                this.eventBus.dispatch(GameEvent.PlayerReady, message.data);
                break;
            default:
                throw new Error(`Unknown message type: ${message.type}`);
        }
    }


    async start(playerName: string): Promise<void> {
        this.lastPlayerName = playerName;
        await this.connection.start();
        await this.connection.invoke("JoinOrReconnect", playerName);
    }

    public reveal(): void {
        this.connection.invoke("Reveal");
    }

    public async playAgain(): Promise<void> {
        await this.connection.invoke("JoinOrReconnect", this.lastPlayerName);
    }

    private dispatchJoinIfNotConnected(message: IPlayerOutgoingMessage<unknown>): void {
        if(!this.isConnected){
            this.eventBus.dispatch(GameEvent.Join, message.data);
            this.isConnected = true;
        }
    }
}
