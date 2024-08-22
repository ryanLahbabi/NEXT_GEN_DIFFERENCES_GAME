import Player from '@app/class/game-logic/player/player';
import EmissionFilter from '@app/gateways/emission-filter';
import { User } from '@app/gateways/game.gateway.constants';

export default class PlayerGroup {
    static existingLobbyIds = [];
    players: Player[] = [];
    protected playerNbr = 0;
    protected deserters: Player[] = [];
    protected id: string;
    protected valid: boolean;

    constructor(private minPlayerNbr: number, private maxPlayerNbr: number) {
        this.setId();
    }

    get playersInPlayerGroup() {
        return this.players;
    }

    get getDeserters() {
        return this.deserters;
    }

    get getPlayerNbr(): number {
        return this.playerNbr;
    }

    get getPlayerNames(): string[] {
        return this.players.map((p) => p.name);
    }

    get isValid(): boolean {
        return this.valid;
    }

    get getLobbyId(): string {
        return this.id;
    }

    get host() {
        if (this.players.length) return this.players[0];
        return undefined;
    }

    joinUser(user: User, onJoin?: (player: Player) => void): boolean {
        const newPlayer = new Player(user);
        return this.joinPlayer(newPlayer, onJoin);
    }

    joinPlayer(player: Player, onJoin?: (player: Player) => void): boolean {
        const addedPlayer = this.addPlayer(player);
        if (addedPlayer) {
            if (!this.id) this.setId();
            if (onJoin) onJoin(addedPlayer);
            return true;
        }
        return false;
    }

    leave(clientId: string, deserter: boolean): Player {
        const foundPlayer = this.removePlayer(clientId);
        if (foundPlayer) {
            if (deserter) this.deserters.push(foundPlayer);
            this.validate();
        }
        return foundPlayer;
    }

    transferPlayerTo(playerId: string, otherLobby: PlayerGroup): boolean {
        const removedPlayer = this.removePlayer(playerId);
        let addedPlayer = false;
        if (removedPlayer) addedPlayer = otherLobby.joinPlayer(removedPlayer);
        return addedPlayer;
    }

    getPlayer(clientId: string): Player | undefined {
        return this.players.find((player) => player.client.id === clientId);
    }

    getPlayerByName(playerName: string): Player | undefined {
        return this.players.find((player) => player.name === playerName);
    }

    getPlayerByIndex(index: number): Player | undefined {
        if (index > this.playerNbr || index < 0) return undefined;
        return this.players[index];
    }

    isPlayerPresent(clientId: string): boolean {
        return this.players.some((player) => player.client.id === clientId);
    }

    empty() {
        for (const player of this.players) player.client.leave(this.id);
        PlayerGroup.existingLobbyIds.filter((id) => id !== this.id);
        this.id = undefined;
        this.players = [];
        this.deserters = [];
        this.playerNbr = 0;
        this.validate();
    }

    forEachPlayer(func: (player: Player) => boolean) {
        for (const player of this.players) if (func(player)) return true;
        return false;
    }

    sendMessageToGroup<T>(message: T, emissionFilter: EmissionFilter<T>) {
        if (this.playerNbr) emissionFilter.toLobby(this.id, message);
    }

    sendMessageToPlayerByName<T>(playerName: string, message: T, emissionFilter: EmissionFilter<T>): boolean {
        for (const player of this.players)
            if (player.name === playerName) {
                emissionFilter.toClient(player.client, message);
                return true;
            }
        return false;
    }

    sendMessageToPlayerById<T>(playerId: string, message: T, emissionFilter: EmissionFilter<T>): boolean {
        for (const player of this.players)
            if (player.client.id === playerId) {
                emissionFilter.toClient(player.client, message);
                return true;
            }
        return false;
    }

    protected validate(): void {
        const notEnoughPlayers = this.playerNbr < this.minPlayerNbr;
        const tooMuchPlayers = this.playerNbr > this.maxPlayerNbr;
        this.valid = !notEnoughPlayers && !tooMuchPlayers;
    }

    protected addUser(user: User, verification = true): Player {
        const newPlayer = new Player(user);
        return this.addPlayer(newPlayer, verification);
    }

    protected addPlayer(player: Player, verification = true): Player | undefined {
        if (verification) {
            const isAlreadyPresent = this.isPlayerPresent(player.client.id);
            const fullLobby = this.maxPlayerNbr < this.playerNbr + 1;
            if (isAlreadyPresent || fullLobby) return undefined;
        }

        player.client.join(this.id);
        this.players.push(player);
        this.playerNbr++;
        this.validate();
        return player;
    }

    protected removePlayer(clientId: string): Player {
        for (let i = 0; i < this.playerNbr; i++) {
            const player = this.players[i];
            if (player.client.id === clientId) {
                player.client.leave(this.id);
                this.players.splice(i, 1);
                this.playerNbr--;
                this.validate();
                return player;
            }
        }
        return undefined;
    }

    private setId() {
        let id: string;
        const idMax = 10000000000;
        while (!id || PlayerGroup.existingLobbyIds.includes(id)) id = Math.floor(Math.random() * idMax).toString();
        PlayerGroup.existingLobbyIds.push(id);
        this.id = id;
    }
}
