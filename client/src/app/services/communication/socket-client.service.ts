import { Injectable, OnDestroy } from '@angular/core';
import { AccountService } from '@app/services/account/account.service';
import { Event } from '@common/socket-event-constants';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService implements OnDestroy {
    clientSocket: Socket;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    // constructor(private router: Router) {}

    ngOnDestroy() {
        this.disconnect();
    }

    isSocketAlive() {
        return this.clientSocket && this.clientSocket.connected;
    }

    connect(authService: AccountService) {
        if (!this.isSocketAlive()) {
            this.clientSocket = io(environment.socketUrl, {
                transports: ['websocket'],
                auth: { authorization: `Bearer ${authService.token!}` },
                upgrade: true,
            }).connect();
        }
    }

    disconnect() {
        if (this.isSocketAlive()) this.clientSocket = this.clientSocket.disconnect();
    }

    on<T>(event: Event<T>, action: (data: T) => void): void {
        this.clientSocket.on(event.name, action);
    }

    send<T>(event: string, data?: T): void {
        if (data) {
            this.clientSocket.emit(event, data);
        } else {
            this.clientSocket.emit(event);
        }
    }
    removeListener<T>(event: Event<T>) {
        this.clientSocket.removeAllListeners(event.name);
    }
}
