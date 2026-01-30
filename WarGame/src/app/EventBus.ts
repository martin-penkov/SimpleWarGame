type SubscribeHandler = (payload?: unknown) => void;

type EventListener = {
    handler: SubscribeHandler;
    context?: unknown;
};

export class EventBus<T> {
    private listenersByEvent: Map<T, EventListener[]>;
    constructor() {
        this.listenersByEvent = new Map();
    }

    public subscribe(event: T, handler: SubscribeHandler, context?: unknown): void {
        let listeners = this.listenersByEvent.get(event);

        if (!listeners) {
            listeners = [];
            this.listenersByEvent.set(event, listeners);
        }

        listeners.push({ handler, context });
    }

    public dispatch(event: T, payload?: unknown): void {
        const listeners = this.listenersByEvent.get(event);
        if (listeners) {
            listeners.forEach((listener) => this.executeListener(listener, payload));
        }
    }

    protected executeListener(listener: EventListener, payload?: unknown): void {
        listener.handler.call(listener.context || this, payload);
    }
}
