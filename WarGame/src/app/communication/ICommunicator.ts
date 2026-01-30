import { IPlayerOutgoingMessage } from "./types/PlayerOutgoingMessage";

export interface ICommunicator {
    start(playerName: string): Promise<void>;
    handleMessageFromServer(message: IPlayerOutgoingMessage<unknown>): void
    reveal(): void
    playAgain(): Promise<void>
}
