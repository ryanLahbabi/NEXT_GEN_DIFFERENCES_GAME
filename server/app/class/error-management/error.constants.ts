import ErrorCodes from './error-codes';
const EC = ErrorCodes;

EC.load();

export namespace Error {
    export namespace Misc {
        export const UNKNOWN = EC.getByName('UNKNOWN');
    }

    export namespace User {
        export const FRIEND_NOT_FOUND = EC.getByName('USER_NOT_FOUND');
        export const USER_NOT_FOUND = EC.getByName('USER_NOT_FOUND');
        export const CANNOT_BLOCK_ONESELF = EC.getByName('CANNOT_BLOCK_ONESELF');
        export const CANNOT_UNBLOCK_ONESELF = EC.getByName('CANNOT_UNBLOCK_ONESELF');
        export const USER_ALREADY_BLOCKED = EC.getByName('USER_ALREADY_BLOCKED');
        export const USER_NOT_BLOCKED = EC.getByName('USER_NOT_BLOCKED');
        export const CANNOT_BEFRIEND_ONESELF = EC.getByName('CANNOT_BEFRIEND_ONESELF');
        export const RESPONDING_TO_HIMSELF = EC.getByName('RESPONDING_TO_HIMSELF');
        export const FRIEND_REQUEST_NOT_FOUND = EC.getByName('FRIEND_REQUEST_NOT_FOUND');
        export const CANNOT_SEND_FRIEND_REQUEST_IF_BLOCKED = EC.getByName('CANNOT_SEND_FRIEND_REQUEST_IF_BLOCKED');
        export const USER_ALREADY_CONNECTED = EC.getByName('USER_ALREADY_CONNECTED');
        export const BIOGRAPHY_TOO_LONG = EC.getByName('BIOGRAPHY_TOO_LONG');
    }

    export namespace Auth {
        export const USERNAME_IN_USE = EC.getByName('USERNAME_IN_USE');
        export const EMAIL_IN_USE = EC.getByName('EMAIL_IN_USE');
        export const INVALID_TOKEN = EC.getByName('INVALID_TOKEN');
        export const UNDEFINED_TOKEN = EC.getByName('UNDEFINED_TOKEN');
        export const MULTIPLE_CONNECTIONS = EC.getByName('MULTIPLE_CONNECTIONS');
        export const SOCKET_CONNECTION_REQUIRED = EC.getByName('SOCKET_CONNECTION_REQUIRED');
    }

    export namespace Chan {
        export const CANNOT_DELETE_CHANNEL = EC.getByName('CANNOT_DELETE_CHANNEL');
        export const CHANNEL_NOT_FOUND = EC.getByName('CHANNEL_NOT_FOUND');
        export const USER_ALREADY_IN_CHANNEL = EC.getByName('USER_ALREADY_IN_CHANNEL');
        export const USER_NOT_IN_CHANNEL = EC.getByName('USER_NOT_IN_CHANNEL');
        export const CANNOT_DELETE_GLOBAL_CHANNEL = EC.getByName('CANNOT_DELETE_GLOBAL_CHANNEL');
    }

    export namespace Game {
        export const COORDINATES_OUT_OF_BOUND = EC.getByName('COORDINATES_OUT_OF_BOUND');
        export const BAD_GAMEMODE = EC.getByName('BAD_GAMEMODE');
        export const GAME_NOT_FOUND = EC.getByName('GAME_NOT_FOUND');
        export const NOT_ENOUGH_PLAYERS = EC.getByName('NOT_ENOUGH_PLAYERS');
        export const PLAYER_NOT_IN_GAME = EC.getByName('PLAYER_NOT_IN_GAME');
        export const CURRENT_DOWNTIME = EC.getByName('CURRENT_DOWNTIME');
        export const WRONG_GAMEMODE = EC.getByName('WRONG_GAMEMODE');
        export const UNAUTHORIZED_ACTION = EC.getByName('UNAUTHORIZED_ACTION');
    }

    export namespace Card {
        export const CARD_DOES_NOT_EXIST = EC.getByName('CARD_DOES_NOT_EXIST');
    }
}
