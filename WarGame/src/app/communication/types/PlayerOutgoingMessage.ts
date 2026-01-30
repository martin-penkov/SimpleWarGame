import { PlayerOutgoingMessageType } from "./PlayerOutgoingMessageType";

export interface IPlayerOutgoingMessage<T> {
    type: PlayerOutgoingMessageType;
    data: T;
};

