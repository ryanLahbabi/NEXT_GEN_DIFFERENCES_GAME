/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line @typescript-eslint/ban-types
import { Event } from '@common/socket-event-constants';
type CallbackSignature = (params: unknown) => unknown;

export class SocketTestHelper {
    on<T>(event: Event<T>, callback: CallbackSignature): void {
        if (!this.callbacks.has(event.name)) {
            this.callbacks.set(event.name, []);
        }

        this.callbacks.get(event.name)!.push(callback);
    }

    // eslint-disable-next-line no-unused-vars
    send(event: string, params?: unknown): void {
        return;
    }

    // eslint-disable-next-line no-unused-vars
    emit(event: string, ...params: unknown[]): void {
        return;
    }

    disconnect(): void {
        return;
    }

    connect(): void {
        return;
    }

    // eslint-disable-next-line no-unused-vars
    removeListener<T>(event: Event<T>): void {
        return;
    }

    peerSideEmit<T>(event: Event<T>, params?: T) {
        if (!this.callbacks.has(event.name)) {
            return;
        }

        for (const callback of this.callbacks.get(event.name)!) {
            callback(params);
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    private callbacks = new Map<string, CallbackSignature[]>();
}
